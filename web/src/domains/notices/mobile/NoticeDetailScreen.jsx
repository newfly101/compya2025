import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useNoticeDetail } from "@/domains/notices/mobile/hooks/useNoticeDetail.js";
import { formatNoticeDate } from "@/domains/notices/mobile/noticeDate.js";
import RichContent from "@/global/ui/richContent/RichContent.jsx";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { usePageSeo } from "@/infra/seo/usePageSeo.js";
import { stripHtml } from "@/global/utils/html/htmlUtils.js";
import { pushEvent } from "@/infra/analytics/ga.js";
import styles from "./NoticeDetailScreen.module.scss";

const NoticeDetailScreen = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { notice } = useNoticeDetail(slug);

  // 데이터 로드 전(undefined)에는 usePageSeo 가 라우트 기본값을 그대로 둔다.
  const fullTitle = notice?.title ? ROUTE_META.NOTICE_DETAILS.title(notice.title) : undefined;
  const description = notice
    ? (notice.summary || stripHtml(notice.content).slice(0, 120) || undefined)
    : undefined;
  const canonicalPath = notice ? ROUTE_PATHS.notice_details(notice) : undefined;

  usePageSeo({
    title: fullTitle,
    description,
    imageUrl: notice?.imageUrl,
    canonicalPath,
    ogType: notice ? "article" : undefined,
  });

  // document.title 세팅은 usePageSeo 로 일원화. 여기선 GA page_view 만 발생시킨다.
  useEffect(() => {
    if (!fullTitle) return;
    pushEvent({
      event: "page_view",
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: fullTitle,
    });
  }, [fullTitle, location.pathname]);

  if (!notice) return <div className={styles.screen} />;

  const dateText = formatNoticeDate(notice);

  return (
    <div className={styles.screen}>

      {/* ── 히어로 이미지 ─────────────────────────────────── */}
      <div className={styles.hero}>
        {notice.imageUrl
          ? <img src={notice.imageUrl} alt={notice.title} className={styles.heroImg} />
          : <div className={styles.heroEmpty} />
        }
      </div>

      {/* ── 메타 헤더 (날짜 + 제목) ── category 는 서버 응답에 없는 필드라 배지 제거 */}
      <div className={styles.metaHeader}>
        {dateText && (
          <div className={styles.metaRow}>
            <span className={styles.metaDate}>{dateText}</span>
          </div>
        )}
        <h1 className={styles.title}>{notice.title}</h1>
      </div>

      {/* ── 요약 ──────────────────────────────────────────── */}
      {notice.summary && (
        <div className={styles.summary}>
          <p className={styles.summaryLabel}>요약</p>
          <p className={styles.summaryText}>{notice.summary}</p>
        </div>
      )}

      {/* ── 본문 ──────────────────────────────────────────── */}
      {notice.content && (
        <div className={styles.body}>
          <RichContent html={notice.content} />
        </div>
      )}

    </div>
  );
};

export default NoticeDetailScreen;
