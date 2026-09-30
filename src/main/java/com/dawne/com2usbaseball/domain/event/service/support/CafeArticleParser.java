package com.dawne.com2usbaseball.domain.event.service.support;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.TextNode;
import org.jsoup.safety.Safelist;
import org.jsoup.select.Elements;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 카페 글 제목·본문·쿠폰 표 해석 (ADR 0009). 실측 검증된 파이썬 스크립트(reference-cafe_probe.py)의 규칙을 그대로 옮겼다.
 * 네트워크·DB 를 모르는 순수 함수 모음 — 단위 테스트는 fixtures 로 한다.
 */
public final class CafeArticleParser {

    private CafeArticleParser() { }

    // 요일 괄호 "(토)" 를 건너 시각까지 읽는다
    private static final String DATE = "(?:(\\d{4})/)?(\\d{1,2})/(\\d{1,2})(?:\\([^)0-9]{1,3}\\))?(?:\\s*(\\d{1,2}):(\\d{2}))?";
    private static final Pattern DATE_RE = Pattern.compile(DATE);
    private static final Pattern TILDE_DATE_RE = Pattern.compile("~\\s*" + DATE);
    private static final Pattern PAREN_RE = Pattern.compile("\\(([^()]*)\\)");
    private static final Pattern TRAIL_JUNK_RE = Pattern.compile("[\\s\\W_]+$", Pattern.UNICODE_CHARACTER_CLASS);
    private static final Pattern CODE_RE = Pattern.compile("^[A-Z0-9]{4,40}$");

    private static final String[][] COUPON_COLS = {
            {"code", "쿠폰번호", "쿠폰코드"}, {"title", "쿠폰명"}, {"detail", "보상"},
            {"expire", "기한", "기간"}, {"link", "바로가기", "링크"}};

    /** 관리자가 본문 sanitize 를 한 번 더 거치는 허용 목록 — 여기에 없는 태그·속성은 버린다 */
    private static final Safelist SAFELIST = new Safelist()
            .addTags("p", "br", "strong", "b", "img", "table", "tbody", "tr", "td", "th", "hr", "a")
            .addAttributes("img", "src", "loading", "alt")
            .addAttributes("td", "rowspan", "colspan")
            .addAttributes("th", "rowspan", "colspan")
            .addAttributes("a", "href", "target", "rel")
            .addProtocols("img", "src", "https", "http")
            .addProtocols("a", "href", "https", "http")
            .addEnforcedAttribute("a", "rel", "nofollow noopener")
            .addEnforcedAttribute("a", "target", "_blank");

    // ---------------- 제목 ----------------

    /** 이벤트 글 후보인가 — [이벤트] 로 시작하고 모아보기(합본)가 아니어야 한다 */
    public static boolean isEventSubject(String subject) {
        if (subject == null) return false;
        String s = subject.strip();
        return s.startsWith("[이벤트]") && !s.contains("모아보기");
    }

    public static CafeTitle parseTitle(String subject, LocalDateTime written) {
        String s = subject == null ? "" : subject.replaceFirst("^\\s*\\[이벤트\\]\\s*", "");
        Matcher pm = PAREN_RE.matcher(s);
        int targetStart = -1;
        String inner = null;
        while (pm.find()) {
            String in = pm.group(1);
            if (in.contains("~") || DATE_RE.matcher(in).find()) {
                targetStart = pm.start();
                inner = in;
                break;
            }
        }
        String name = (targetStart >= 0 ? s.substring(0, targetStart) : s).strip();
        name = TRAIL_JUNK_RE.matcher(name).replaceFirst("");
        name = name.replaceFirst("\\s*이벤트$", "").strip();
        LocalDateTime expire = null;
        if (inner != null) {
            expire = readDate(inner, written, true);
        }
        return new CafeTitle(name, expire);
    }

    /** 텍스트 안의 "~ M/D HH:mm"(없으면 첫 날짜)를 읽는다. 시각이 없으면 23:59:59. */
    private static LocalDateTime readDate(String text, LocalDateTime written, boolean expireStyle) {
        Matcher m = TILDE_DATE_RE.matcher(text);
        if (!m.find()) {
            m = DATE_RE.matcher(text);
            if (!m.find()) return null;
        }
        return toDateTime(m, written, expireStyle);
    }

    private static LocalDateTime toDateTime(Matcher m, LocalDateTime written, boolean expireStyle) {
        String y = m.group(1);
        int baseYear = written != null ? written.getYear() : LocalDateTime.now().getYear();
        LocalDateTime dt;
        try {
            int mo = Integer.parseInt(m.group(2));
            int d = Integer.parseInt(m.group(3));
            boolean hasTime = m.group(4) != null;
            int hh = hasTime ? Integer.parseInt(m.group(4)) : (expireStyle ? 23 : 0);
            int mm = hasTime ? Integer.parseInt(m.group(5)) : (expireStyle ? 59 : 0);
            int ss = (!hasTime && expireStyle) ? 59 : 0;
            dt = LocalDateTime.of(y != null ? Integer.parseInt(y) : baseYear, mo, d, hh, mm, ss);
        } catch (RuntimeException e) {
            return null; // 13월 같은 이상한 값
        }
        if (y == null && written != null && dt.isBefore(written.minusDays(1))) {
            dt = dt.plusYears(1); // 12월 글의 ~1/5
        }
        return dt;
    }

    // ---------------- 본문 구간 ----------------

    private record Unit(String type, String text, String src, List<List<Cell>> rows) { }

    /** 표 칸 — 병합(rowspan/colspan)을 잃으면 뒤 칸이 앞으로 밀려 표가 어긋난다 (2026-09-30 보름달 이벤트 표) */
    private record Cell(String text, int rowspan, int colspan) { }

    public static CafeBody extractBody(String contentHtml, LocalDateTime written) {
        if (contentHtml == null || contentHtml.isBlank()) return CafeBody.notFound(null);
        Document doc = Jsoup.parseBodyFragment(contentHtml);
        doc.select("script").remove();
        List<Unit> units = unitsOf(doc);
        String banner = units.stream().filter(u -> u.type().equals("img")).map(Unit::src).findFirst().orElse(null);

        int start = -1;
        for (int i = 0; i < units.size(); i++) {
            if (norm(units.get(i)).contains("이벤트기간")) { start = i; break; }
        }
        int end = -1;
        for (int i = units.size() - 1; i >= 0; i--) {
            if (norm(units.get(i)).contains("감사합니다")) { end = i; break; }
        }
        // 시작·끝 중 하나라도 못 찾으면 구간 없음 (운영자가 외부 링크로 등록)
        if (start < 0 || end < 0 || end <= start) return CafeBody.notFound(banner);

        List<Unit> part = units.subList(start, end);
        StringBuilder sb = new StringBuilder();
        List<String> images = new ArrayList<>();
        for (Unit u : part) {
            switch (u.type()) {
                case "p" -> { if (!u.text().isEmpty()) sb.append("<p>").append(escape(u.text()).replace("\n", "<br>")).append("</p>\n"); }
                case "img" -> {
                    images.add(u.src());
                    sb.append("<img src=\"").append(escape(u.src())).append("\" loading=\"lazy\" alt=\"\">\n");
                }
                case "table" -> {
                    sb.append("<table>");
                    for (List<Cell> r : u.rows()) {
                        sb.append("<tr>");
                        for (Cell c : r) {
                            sb.append("<td");
                            if (c.rowspan() > 1) sb.append(" rowspan=\"").append(c.rowspan()).append('"');
                            if (c.colspan() > 1) sb.append(" colspan=\"").append(c.colspan()).append('"');
                            sb.append('>').append(escape(c.text()).replace("\n", "<br>")).append("</td>");
                        }
                        sb.append("</tr>");
                    }
                    sb.append("</table>\n");
                }
                case "hr" -> sb.append("<hr>\n");
                case "other" -> sb.append("<p>(원문에서 확인)</p>\n");
                default -> { } // sticker 등은 버림
            }
        }
        String html = sanitize(sb.toString().strip());
        // 기간 문단 — 시작일·마감일 (제목에 마감이 없을 때 보조)
        String period = units.get(start).text();
        LocalDateTime pStart = null;
        Matcher m = DATE_RE.matcher(period);
        if (m.find()) pStart = toDateTime(m, written, false);
        LocalDateTime pEnd = period.contains("~") ? readDate(period.substring(period.indexOf('~')), written, true) : null;
        return new CafeBody(true, html, images, period, pStart, pEnd, banner);
    }

    private static int span(Element td, String attr) {
        try {
            return Math.max(1, Integer.parseInt(td.attr(attr).trim()));
        } catch (NumberFormatException e) {
            return 1;
        }
    }

    private static String norm(Unit u) {
        return u.text() == null ? "" : u.text().replaceAll("\\s", "");
    }

    private static List<Unit> unitsOf(Document doc) {
        List<Unit> units = new ArrayList<>();
        for (Element comp : doc.select("div.se-component")) {
            if (comp.parents().stream().anyMatch(p -> p.hasClass("se-component"))) continue; // 최상위 블록만
            String type = compType(comp);
            switch (type) {
                case "se-text", "se-sectionTitle", "se-quotation" -> {
                    for (Element p : comp.select("p.se-text-paragraph")) units.add(new Unit("p", textOf(p), null, null));
                }
                case "se-image", "se-imageStrip", "se-imageGroup", "se-sticker" -> {
                    for (Element img : comp.select("img")) {
                        String src = imgSrc(img);
                        if (src != null) units.add(new Unit(type.equals("se-sticker") ? "sticker" : "img", null, src, null));
                    }
                }
                case "se-table" -> {
                    List<List<Cell>> rows = new ArrayList<>();
                    for (Element tr : comp.select("tr")) {
                        List<Cell> cells = new ArrayList<>();
                        for (Element td : tr.select("> td, > th")) cells.add(new Cell(textOf(td), span(td, "rowspan"), span(td, "colspan")));
                        rows.add(cells);
                    }
                    units.add(new Unit("table", null, null, rows));
                }
                case "se-horizontalLine" -> units.add(new Unit("hr", null, null, null));
                default -> units.add(new Unit("other", textOf(comp).substring(0, Math.min(80, textOf(comp).length())), null, null));
            }
        }
        return units;
    }

    private static String compType(Element comp) {
        for (String c : comp.classNames()) {
            if (c.startsWith("se-") && !c.equals("se-component") && !c.startsWith("se-l-")) return c;
        }
        return "unknown";
    }

    private static String imgSrc(Element img) {
        for (String attr : new String[]{"data-lazy-src", "data-src", "src"}) {
            String v = img.attr(attr);
            if (!v.isBlank() && !v.startsWith("data:")) return v;
        }
        return null;
    }

    static String textOf(Element el) {
        Element c = el.clone();
        c.select("br").forEach(br -> br.replaceWith(new TextNode("\n")));
        String t = c.wholeText().replace("​", "").replace(' ', ' ');
        return t.replaceAll("[ \\t]+", " ").strip();
    }

    private static String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    /** 허용 목록으로 한 번 더 거른다. (img src 가 http(s) 가 아니면 속성이 사라진다) */
    public static String sanitize(String html) {
        Document.OutputSettings out = new Document.OutputSettings().prettyPrint(false);
        return Jsoup.clean(html, "", SAFELIST, out);
    }

    // ---------------- 해시 ----------------

    /**
     * 원문 변경 감지용 해시. img src(카페 주소 ↔ S3 주소로 갈리는 값)를 지운 뒤 SHA-256 —
     * 방금 받은 원문 구간과 저장된 본문(S3 주소로 교체됨)을 같은 잣대로 비교하기 위해서다.
     */
    public static String contentHash(String html) {
        if (html == null) return null;
        Document doc = Jsoup.parseBodyFragment(html);
        doc.outputSettings().prettyPrint(false);
        doc.select("[src]").removeAttr("src");
        String canonical = doc.body().html().replaceAll(">\\s+<", "><").strip();
        try {
            byte[] d = MessageDigest.getInstance("SHA-256").digest(canonical.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(d);
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    /**
     * 본문 이미지 주소를 바꾼다(카페 원본 → S3). 바꿀 주소가 없는(업로드 실패) 이미지는 카페에서 직접 못 띄우므로 뺀다.
     */
    public static String rewriteImages(String html, java.util.Map<String, String> replacements) {
        if (html == null) return null;
        Document doc = Jsoup.parseBodyFragment(html);
        doc.outputSettings().prettyPrint(false);
        for (Element img : doc.select("img[src]")) {
            String to = replacements.get(img.attr("src"));
            if (to == null) img.remove();
            else img.attr("src", to);
        }
        return sanitize(doc.body().html());
    }

    // ---------------- 쿠폰 표 ----------------

    public static List<CafeCouponRow> extractCoupons(String contentHtml, LocalDateTime today) {
        List<CafeCouponRow> out = new ArrayList<>();
        if (contentHtml == null || contentHtml.isBlank()) return out;
        Document doc = Jsoup.parseBodyFragment(contentHtml);
        for (Element table : doc.select("table")) {
            Elements rows = table.select("tr");
            if (rows.isEmpty()) continue;
            Elements headCells = rows.get(0).select("> td, > th");
            List<String> header = new ArrayList<>();
            for (Element td : headCells) header.add(String.join(" ", cellLines(td)).replaceAll("\\s", ""));
            int[] col = {-1, -1, -1, -1, -1};
            for (int k = 0; k < COUPON_COLS.length; k++) {
                for (int i = 0; i < header.size(); i++) {
                    final int idx = i;
                    boolean used = java.util.Arrays.stream(col).anyMatch(c -> c == idx);
                    if (col[k] < 0 && !used) {
                        for (int w = 1; w < COUPON_COLS[k].length; w++) {
                            if (header.get(i).contains(COUPON_COLS[k][w])) { col[k] = i; break; }
                        }
                    }
                }
            }
            if (col[0] < 0) continue; // '쿠폰 번호' 칸이 없으면 쿠폰 표가 아니다
            for (int r = 1; r < rows.size(); r++) {
                Elements tds = rows.get(r).select("> td, > th");
                String code = String.join("", cellLines(cell(tds, col[0]))).strip();
                String title = String.join(" ", cellLines(cell(tds, col[1])));
                String detail = String.join("\n", cellLines(cell(tds, col[2])));
                String expireRaw = String.join(" ", cellLines(cell(tds, col[3])));
                LocalDateTime ex = parseCouponExpire(expireRaw, today);
                out.add(new CafeCouponRow(code, title, detail, ex, !CODE_RE.matcher(code).matches(), tds.size() != header.size()));
            }
        }
        return out;
    }

    private static Element cell(Elements tds, int idx) {
        return idx >= 0 && idx < tds.size() ? tds.get(idx) : null;
    }

    private static List<String> cellLines(Element td) {
        List<String> lines = new ArrayList<>();
        if (td == null) return lines;
        Elements paras = td.select("p.se-text-paragraph");
        if (paras.isEmpty()) {
            String t = textOf(td);
            if (!t.isEmpty()) lines.add(t);
        } else {
            for (Element p : paras) {
                String t = textOf(p);
                if (!t.isEmpty()) lines.add(t);
            }
        }
        return lines;
    }

    static LocalDateTime parseCouponExpire(String text, LocalDateTime today) {
        Matcher m = TILDE_DATE_RE.matcher(text);
        if (!m.find()) {
            m = DATE_RE.matcher(text);
            if (!m.find()) return null;
        }
        LocalDateTime dt;
        try {
            boolean hasTime = m.group(4) != null;
            dt = LocalDateTime.of(m.group(1) != null ? Integer.parseInt(m.group(1)) : today.getYear(),
                    Integer.parseInt(m.group(2)), Integer.parseInt(m.group(3)),
                    hasTime ? Integer.parseInt(m.group(4)) : 23, hasTime ? Integer.parseInt(m.group(5)) : 59, hasTime ? 0 : 59);
        } catch (RuntimeException e) {
            return null;
        }
        if (m.group(1) == null && dt.isBefore(today.minusDays(180))) dt = dt.plusYears(1);
        return dt;
    }
}
