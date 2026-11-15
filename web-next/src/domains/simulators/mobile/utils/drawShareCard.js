// 저장용 스킬 카드 이미지 — canvas 2D 로 직접 그린다 (새 라이브러리 없음). 서버 이미지 생성·공유 링크는 쓰지 않는다.
// 배경은 같은 출처(/cards/*.webp)라 canvas 가 오염되지 않는다. 색은 SkillCard 와 같은 토큰을 읽는다
// (CSS 변수는 canvas 에서 못 쓰므로 getComputedStyle 로 한 번 읽는다 — 값은 legendCollectionSkills.tokens.scss 에 있다).

// Figma 04 저장용 이미지 카드(641:3523): 바깥 판(카드 면) 안에 스킬 카드, 판 하단에 닉네임(왼쪽) · "컴프야펀"(오른쪽).
// 스킬 카드 안: 제목(구단 이름) → 스킬 1번 칸 위 횟수 박스(오른쪽) → 스킬 3줄 → 포지션(오른쪽 아래).
const PAD = 40;
const CARD_W = 560;
const CARD_H = 840; // 2 : 3, SkillCard 와 같은 비율
const FOOT_H = 120;
const W = CARD_W + PAD * 2;
const H = PAD + CARD_H + FOOT_H;
const GRADE_TOKEN = { 레전드: "legend", 플래티넘: "platinum", 히어로: "hero", 노말: "normal" };
const FALLBACK = { legend: ["#8b5cf6", "#5b21b6"], platinum: ["#e5b83a", "#a97b12"], hero: ["#5fbf5f", "#2f7d32"], normal: ["#8b9bb0", "#566679"] };
const WHITE = "#ffffff"; // 카드 사진 위 글자 — 인게임 색 위 글자 예외(fe-design-audit § 4)

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const cssVar = (name, fallback) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

const gradeColors = (grade) => {
  const key = GRADE_TOKEN[grade] ?? "normal";
  return [cssVar(`--color-lcsk-grade-${key}`, FALLBACK[key][0]), cssVar(`--color-lcsk-grade-${key}-end`, FALLBACK[key][1])];
};

const rr = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

/**
 * card: { kind: "hitter"|"pitcher", team, name, position, slots: [{ name, skillGrade, tier? }] x3, counts: { gsb, sel }, nickname }
 * 반환: PNG Blob
 */
export const drawShareCard = async (card) => {
  const family = getComputedStyle(document.body).fontFamily || "sans-serif";
  const bg = await loadImage(`/cards/${card.kind}_legend.webp`);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.textBaseline = "middle";

  // 바깥 판 — 화면 테마의 카드 면·테두리
  rr(ctx, 1, 1, W - 2, H - 2, 32);
  ctx.fillStyle = cssVar("--color-bg-card", "#1f1a29");
  ctx.fill();
  ctx.strokeStyle = cssVar("--color-border-strong", "#878097");
  ctx.lineWidth = 2;
  ctx.stroke();

  // 스킬 카드
  ctx.save();
  rr(ctx, PAD, PAD, CARD_W, CARD_H, 24);
  ctx.clip();
  ctx.drawImage(bg, PAD, PAD, CARD_W, CARD_H);

  const inX = PAD + 24;
  const inW = CARD_W - 48;

  // 제목
  ctx.fillStyle = WHITE;
  ctx.textAlign = "center";
  ctx.font = `700 34px ${family}`;
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 8;
  ctx.fillText(`${card.team} ${card.name}`, PAD + CARD_W / 2, PAD + 56);
  ctx.shadowBlur = 0;

  const rowH = 86;
  const gap = 14;
  const rowsTop = PAD + CARD_H - 64 - (rowH * 3 + gap * 2);

  // 횟수 박스 — 스킬 1번 칸 바로 위, 오른쪽 정렬
  const cW = 230;
  const cH = 132;
  const cX = PAD + CARD_W - 24 - cW;
  const cY = rowsTop - 20 - cH;
  rr(ctx, cX, cY, cW, cH, 14);
  ctx.fillStyle = "rgba(15, 10, 20, 0.75)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = `500 28px ${family}`;
  ctx.fillStyle = WHITE;
  [["고스변", card.counts.gsb], ["선변", card.counts.sel]].forEach(([label, n], i) => {
    const y = cY + 40 + i * 52;
    ctx.textAlign = "left";
    ctx.fillText(label, cX + 22, y);
    ctx.textAlign = "right";
    ctx.fillText(String(n), cX + cW - 22, y);
  });

  // 스킬 3줄 (아래쪽)
  card.slots.forEach((slot, i) => {
    const y = rowsTop + i * (rowH + gap);
    const [start, end] = gradeColors(slot.skillGrade);
    const g = ctx.createLinearGradient(0, y, 0, y + rowH);
    g.addColorStop(0, start);
    g.addColorStop(1, end);
    rr(ctx, inX, y, inW, rowH, 12);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = `700 34px ${family}`;
    ctx.textAlign = "center";
    ctx.fillStyle = WHITE;
    ctx.fillText(slot.tier ? `${slot.name} ${slot.tier}` : slot.name, PAD + CARD_W / 2, y + rowH / 2 + 2);
  });

  // 포지션 (오른쪽 아래)
  ctx.font = `600 24px ${family}`;
  ctx.textAlign = "right";
  ctx.fillText(card.position ?? "", PAD + CARD_W - 24, PAD + CARD_H - 30);
  ctx.restore();

  // 판 하단 — 닉네임 · 사이트 이름
  const footY = PAD + CARD_H + FOOT_H / 2;
  ctx.fillStyle = cssVar("--color-text-primary", "#f5f3f7");
  ctx.font = `700 34px ${family}`;
  ctx.textAlign = "left";
  const nick = card.nickname ?? "";
  ctx.fillText(nick.length > 14 ? `${nick.slice(0, 14)}…` : nick, PAD + 8, footY);
  ctx.fillStyle = cssVar("--color-text-secondary", "#b8b2c4");
  ctx.font = `500 24px ${family}`;
  ctx.textAlign = "right";
  ctx.fillText("컴프야펀", W - PAD - 8, footY);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("이미지를 만들지 못했습니다"))), "image/png");
  });
};

/**
 * 이미지 파일 다운로드 — PC·모바일 모두 공유 시트 없이 바로 저장한다(사용자 결정 2026-10-27).
 * 반환: "downloaded"
 */
export const deliverImage = async (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
};
