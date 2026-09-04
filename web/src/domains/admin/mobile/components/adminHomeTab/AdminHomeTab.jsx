import { ADMIN_HOME_CARDS } from "@/domains/admin/mobile/ADMIN_TABS.js";
import styles from "./AdminHomeTab.module.scss";

const todayStr = () => new Date().toISOString().slice(0, 10);

// counts/domains 는 AdminShellScreen 이 useAdminCounts() 로 이미 불러온 것을 그대로 받는다.
// 홈 탭이 단독으로 다시 fetch 하지 않는다 — 탭을 옮겨 다녀도 재요청이 없다.
export default function AdminHomeTab({ onNavigateTab, counts, domains }) {
  // adminUsers 는 counts.user(useAdminCounts 가 이미 계산)로 충분해 여기선 원본 리스트가 필요 없다.
  const { quiz, events, coupon, notices } = domains;

  // 퀴즈: 회차 + 이미지가 모두 있는 가장 큰 회차.
  // [확인필요] 원래 규칙은 "노출 ON" 도 조건이지만 현재 퀴즈 데이터 모델에 visible 필드가 없어
  // (AdminQuizScreen 필드: round/imageUrl/updatedAt 뿐) 이 조건은 뺐다 — 퀴즈 화면 트랙에서 필드 추가 시 재검토.
  const latestQuiz =
    counts.quiz == null
      ? null
      : [...quiz.quizAnswers]
          .filter((q) => q.imageUrl)
          .sort((a, b) => Number(b.round) - Number(a.round))[0] ?? null;

  const today = todayStr();

  const activeEventCount =
    counts.event == null
      ? null
      : events.events.filter((e) => e.visible && (!e.expireAt || e.expireAt.slice(0, 10) >= today)).length;

  const usableCouponCount =
    counts.coupon == null
      ? null
      : coupon.coupons.filter((c) => c.visible && (!c.expireAt || c.expireAt.slice(0, 10) >= today)).length;

  const pinnedNotice =
    counts.notice == null ? null : notices.siteNotices.find((n) => n.isPinned && n.isVisible) ?? null;

  return (
    <div className={styles.homeTab}>
      <div className={styles.titleBlock}>
        <b className={styles.title}>빠른 이동</b>
        <span className={styles.subtitle}>관리 메뉴로 이동</span>
      </div>

      <div className={styles.cardGrid}>
        {ADMIN_HOME_CARDS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={styles.card}
            onClick={() => onNavigateTab(tab.key)}
          >
            <span className={styles.cardCount}>{counts[tab.key] ?? "–"}</span>
            <span className={styles.cardLabel}>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.summaryCard}>
        <h3 className={styles.summaryTitle}>지금 홈에 노출 중</h3>
        <dl className={styles.summaryList}>
          <div className={styles.summaryRow}>
            <dt>퀴즈</dt>
            <dd>{latestQuiz ? `${latestQuiz.round}회차` : "–"}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>이벤트</dt>
            <dd>{activeEventCount != null ? `진행중 ${activeEventCount}개` : "–"}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>쿠폰</dt>
            <dd>{usableCouponCount != null ? `사용가능 ${usableCouponCount}개` : "–"}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt>고정 공지</dt>
            <dd>{pinnedNotice ? pinnedNotice.title : "없음"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
