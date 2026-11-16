import { notFound, permanentRedirect } from "next/navigation";
import PageShell from "@/components/layout/PageShell.jsx";
import NoticeDetailScreen from "@/features/notices/NoticeDetailScreen.jsx";
import { fetchNotices, fetchNoticeDetail } from "@/features/notices/api.js";
import { noticeTitleToSlug } from "@/features/notices/noticeSlug.js";
import { noticeDetailPath } from "@/lib/routePath.js";
import { stripHtml } from "@/components/richContent/sanitizeHtml.js";
import { buildMetadata } from "@/lib/seo.js";

export const revalidate = 300;
export const dynamicParams = true; // 새 공지는 첫 요청 때 생성

// 빌드 시 API 가 죽어 있어도 빌드가 깨지지 않게 빈 배열 → 요청 시 생성.
export async function generateStaticParams() {
  try {
    const { siteNotices } = await fetchNotices();
    return siteNotices.map((n) => ({ slug: noticeTitleToSlug(n.title, n.id) }));
  } catch {
    return [];
  }
}

const decode = (s) => {
  try { return decodeURIComponent(s); } catch { return s; }
};

// 주소 조각이 숫자면 id, 아니면 slug(`제목-id`, id 접미어 없던 옛 주소도 허용). 목록(INTERNAL)에서 찾는다.
const findNotice = async (rawSlug) => {
  const param = decode(rawSlug);
  const { siteNotices } = await fetchNotices();
  if (/^\d+$/.test(param)) return siteNotices.find((n) => n.id === Number(param)) ?? null;
  return siteNotices.find((n) => {
    const slug = noticeTitleToSlug(n.title, n.id);
    return slug === param || slug === `${param}-${n.id}`;
  }) ?? null;
};

// 목록 응답엔 본문이 없어 찾은 글만 상세 API 로 한 번 더 받는다.
const loadNotice = async (rawSlug) => {
  const found = await findNotice(rawSlug);
  if (!found) return null;
  return { ...found, ...(await fetchNoticeDetail(found.id)) };
};

export async function generateMetadata({ params }) {
  const notice = await loadNotice((await params).slug);
  if (!notice) return {};
  const description = notice.summary || stripHtml(notice.content).slice(0, 120) || undefined;
  return {
    ...buildMetadata({
      title: `공지사항 | ${notice.title}`,
      description,
      path: noticeDetailPath(notice),
      images: notice.imageUrl ? [{ url: notice.imageUrl }] : undefined,
      type: "article",
    }),
  };
}

export default async function NoticeDetailPage({ params }) {
  const { slug } = await params;
  const notice = await loadNotice(slug);
  if (!notice) notFound();
  // 숫자 주소(옛 색인 등)는 제목 slug 주소로 영구 이동 — 이동한 주소는 숫자만이 될 수 없어 루프 없음.
  if (/^\d+$/.test(decode(slug))) permanentRedirect(encodeURI(noticeDetailPath(notice)));
  return (
    <PageShell title="공지사항">
      <NoticeDetailScreen notice={notice} />
    </PageShell>
  );
}
