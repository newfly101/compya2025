import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ADMIN_HOME_CARDS } from "@/domains/admin/mobile/ADMIN_TABS.js";
import { requestAdminQuizAll } from "@/domains/quiz/store/admin/thunks.js";
import { requestAdminGetAllEventList } from "@/domains/events/store/admin/thunks.js";
import { requestGetAdminCouponList } from "@/domains/coupons/store/admin/thunks.js";
import { requestAdminGetNoticeList } from "@/domains/notices/store/admin/thunks.js";
import { requestAdminGetUserList } from "@/domains/users/store/admin/thunks.js";
import styles from "./AdminHomeTab.module.scss";

const todayStr = () => new Date().toISOString().slice(0, 10);

// 로딩 중이거나 실패한 도메인은 건수를 못 구한 것으로 보고 null 을 돌려준다.
// 호출부는 null 이면 0/가짜 숫자 대신 "–" 를 보여준다.
const countOf = (domainState, listKey) => {
  if (!domainState || domainState.loading || domainState.error) return null;
  return domainState[listKey]?.length ?? null;
};

export default function AdminHomeTab({ onNavigateTab }) {
  const dispatch = useDispatch();
  const quiz = useSelector((s) => s.quiz);
  const events = useSelector((s) => s.events);
  const coupon = useSelector((s) => s.coupon);
  const notices = useSelector((s) => s.notices);
  const adminUsers = useSelector((s) => s.adminUsers);

  // 필요한 만큼만: 이미 불러와진(비어있지 않은) 도메인은 다시 부르지 않는다.
  // 하나가 실패해도 나머지 dispatch 는 그대로 진행 — 홈 탭 전체가 죽지 않는다.
  useEffect(() => {
    if (quiz.quizAnswers.length === 0 && !quiz.loading) dispatch(requestAdminQuizAll());
    if (events.events.length === 0 && !events.loading) dispatch(requestAdminGetAllEventList());
    if (coupon.coupons.length === 0 && !coupon.loading) dispatch(requestGetAdminCouponList());
    if (notices.siteNotices.length === 0 && !notices.loading) dispatch(requestAdminGetNoticeList());
    if (adminUsers.users.length === 0 && !adminUsers.loading) dispatch(requestAdminGetUserList());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const counts = {
    quiz: countOf(quiz, "quizAnswers"),
    event: countOf(events, "events"),
    coupon: countOf(coupon, "coupons"),
    notice: countOf(notices, "siteNotices"),
    user: countOf(adminUsers, "users"),
  };

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
        <span className={styles.titleBar} aria-hidden="true" />
        <div>
          <h2 className={styles.title}>빠른 이동</h2>
          <p className={styles.subtitle}>관리 메뉴로 빠르게 이동하세요</p>
        </div>
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
            <span className={styles.cardDesc}>{tab.description}</span>
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
