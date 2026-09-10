import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { formatNoticeDate } from "@/domains/notices/mobile/noticeDate.js";
import PinnedBadge from "@/global/ui/badge/PinnedBadge.jsx";
import styles from "./NoticeCard.module.scss";

// variant="pinned" — 「중요 공지」. 항상 큰 배너형(이미지 없으면 그라디언트 대체) + 강조 배지.
// variant="list"   — 「사이트 공지」 목록. 이미지가 있는 공지만 배너형으로 보여주고,
//                     이미지가 없는 공지는 아래 텍스트 위주 카드로 자연스럽게 떨어진다.
const NoticeCard = ({ notice, variant = "list" }) => {
  const to = ROUTE_PATHS.notice_details(notice);
  const dateText = formatNoticeDate(notice);
  const isPinned = variant === "pinned";
  const showBanner = isPinned || !!notice.imageUrl;

  if (showBanner) {
    return (
      <Link
        to={to}
        className={isPinned ? styles.featuredCard : `${styles.featuredCard} ${styles.listBanner}`}
      >
        <div className={styles.featuredThumb}>
          {notice.imageUrl
            ? <img src={notice.imageUrl} alt="" />
            : <div className={styles.thumbEmpty} />
          }
          {/* 「사이트 공지」 목록과 섞여도 구분되도록 중요 공지에만 배지를 얹는다 */}
          {isPinned && (
            <div className={styles.pinnedBadge}>
              <PinnedBadge variant="important" />
            </div>
          )}
        </div>
        {/* 제목과 chevron 을 같은 행에 두어 세로 중심을 맞춘다 (일반 카드의 cardBottom 구조 참고) */}
        <div className={styles.featuredTitleRow}>
          <p className={styles.featuredTitle}>{notice.title}</p>
          <span className={styles.chevron}>›</span>
        </div>
        {dateText && <span className={styles.metaDate}>{dateText}</span>}
        {isPinned && notice.summary && (
          <p className={styles.featuredSummary}>{notice.summary.split("\n")[0]}</p>
        )}
      </Link>
    );
  }

  return (
    <Link to={to} className={styles.card}>
      <div className={styles.cardContent}>
        <p className={styles.title}>{notice.title}</p>
        {notice.summary && (
          <p className={styles.summary}>{notice.summary.split("\n")[0]}</p>
        )}
      </div>
      <div className={styles.cardBottom}>
        {dateText && <span className={styles.date}>{dateText}</span>}
        <span className={styles.chevron}>›</span>
      </div>
    </Link>
  );
};

export default NoticeCard;
