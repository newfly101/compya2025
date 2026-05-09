import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useNoticeDetail } from "@/domains/notices/mobile/hooks/useNoticeDetail.js";
import LabelBadge from "@/global/ui/badge/LabelBadge.jsx";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
import { pushEvent } from "@/infra/analytics/ga.js";
import styles from "./NoticeDetailScreen.module.scss";

const NoticeDetailScreen = () => {
  const { id } = useParams();
  const location = useLocation();
  const { notice } = useNoticeDetail(id);

  useEffect(() => {
    if (!notice?.title) return;
    const fullTitle = ROUTE_META.NOTICE_DETAILS.title(notice.title);
    document.title = fullTitle;
    pushEvent({
      event: "page_view",
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: fullTitle,
    });
  }, [notice?.title, location.pathname]);

  if (!notice) return <div className={styles.screen} />;

  return (
    <div className={styles.screen}>

      {/* ── 히어로 이미지 ─────────────────────────────────── */}
      <div className={styles.hero}>
        {notice.imageUrl
          ? <img src={notice.imageUrl} alt={notice.title} className={styles.heroImg} />
          : <div className={styles.heroEmpty} />
        }
      </div>

      {/* ── 메타 헤더 (배지 + 날짜 + 제목) ──────────────── */}
      <div className={styles.metaHeader}>
        <div className={styles.metaRow}>
          {notice.category && <LabelBadge variant="update" label={notice.category} />}
          <span className={styles.metaDate}>{notice.publishedAt?.slice(0, 10)}</span>
        </div>
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
          <p className={styles.bodyText}>{notice.content}</p>
        </div>
      )}

    </div>
  );
};

export default NoticeDetailScreen;
