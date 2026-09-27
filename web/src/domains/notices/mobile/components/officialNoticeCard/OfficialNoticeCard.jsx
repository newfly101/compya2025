import PinnedBadge from "@/global/ui/badge/PinnedBadge.jsx";
import { formatNoticeDate } from "@/domains/notices/mobile/noticeDate.js";
import styles from "./OfficialNoticeCard.module.scss";

// 카드 전체가 외부 링크다 — <a> 로 두면 키보드·스크린리더로도 열리고 window.open 이 필요 없다.
const OfficialNoticeCard = ({ notice }) => {
  const dateText = formatNoticeDate(notice);

  return (
    <a
      className={styles.card}
      href={notice.externalUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.cardTop}>
        <PinnedBadge variant="cafe" />
        <span className={styles.externalLabel}>외부 링크 →</span>
      </div>
      <p className={styles.title}>{notice.title}</p>
      {notice.summary && <p className={styles.summary}>{notice.summary}</p>}
      {dateText && <span className={styles.date}>{dateText}</span>}
    </a>
  );
};

export default OfficialNoticeCard;
