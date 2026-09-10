import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useNoticeDetail } from "@/domains/notices/mobile/hooks/useNoticeDetail.js";
import { formatNoticeDate } from "@/domains/notices/mobile/noticeDate.js";
import RichContent from "@/global/ui/richContent/RichContent.jsx";
import ImageLightbox from "@/domains/notices/mobile/components/imageLightbox/ImageLightbox.jsx";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { usePageSeo } from "@/infra/seo/usePageSeo.js";
import { stripHtml } from "@/global/utils/html/htmlUtils.js";
import { pushEvent } from "@/infra/analytics/ga.js";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import styles from "./NoticeDetailScreen.module.scss";

const NoticeDetailScreen = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { notice, error, notFound, retry } = useNoticeDetail(slug);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  // 로딩 / 오류(재시도) / 없는 글(목록엔 도달했으나 이 글이 없음) 을 갈라서 보여준다 —
  // 셋 다 "notice 없음"은 같지만 사용자에게 필요한 안내가 다르다.
  if (!notice) {
    if (error) {
      return (
        <div className={styles.screen}>
          <StateBox status="error" message={error} onRetry={retry} />
        </div>
      );
    }
    if (notFound) {
      return (
        <div className={styles.screen}>
          <StateBox status="empty" message="삭제되었거나 존재하지 않는 공지입니다." />
          <Link to={ROUTE_PATHS.notices} className={styles.backLink}>공지 목록으로</Link>
        </div>
      );
    }
    return (
      <div className={styles.screen}>
        <StateBox status="loading" />
      </div>
    );
  }

  const dateText = formatNoticeDate(notice);

  return (
    <div className={styles.screen}>

      {/* ── 히어로 이미지 ─────────────────────────────────── */}
      <div className={styles.hero}>
        {notice.imageUrl
          ? (
            <button
              type="button"
              className={styles.heroBtn}
              onClick={() => setLightboxOpen(true)}
              aria-label="공지 이미지 크게 보기"
            >
              <img src={notice.imageUrl} alt={notice.title} className={styles.heroImg} />
            </button>
          )
          : <div className={styles.heroEmpty} />
        }
      </div>

      <ImageLightbox
        open={lightboxOpen}
        imageUrl={notice.imageUrl}
        alt={notice.title}
        onClose={() => setLightboxOpen(false)}
      />

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
