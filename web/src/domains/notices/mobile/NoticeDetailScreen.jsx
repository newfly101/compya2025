import { useParams, useNavigate } from "react-router-dom";
import { useNoticeDetail } from "@/domains/notices/mobile/hooks/useNoticeDetail.js";
import LabelBadge from "@/global/ui/badge/LabelBadge.jsx";
import styles from "./NoticeDetailScreen.module.scss";

const NoticeDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notice } = useNoticeDetail(id);

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
