import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AdminDashBoardPage.module.scss";

/** MOCK DATA (API 연동 전) */
const DASHBOARD_DATA = {
  notice: {
    total: 12,
    visible: 9,
    hidden: 3,
  },
  event: {
    ongoing: 2,
  },
  coupon: {
    active: 5,
  },
  user: {
    total: 1248,
    active: 1180,
    ban: 42,
    suspended: 26,
    newLast7Days: 63,
  },
};

const AdminDashBoardPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1>관리자 대시보드</h1>

      {/* 콘텐츠 요약 */}
      <section className={styles.section}>
        <h2>콘텐츠 현황</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <span className={styles.label}>공지사항</span>
            <strong>{DASHBOARD_DATA.notice.total}</strong>
            <p>
              공개 {DASHBOARD_DATA.notice.visible} / 비공개{" "}
              {DASHBOARD_DATA.notice.hidden}
            </p>
          </div>

          <div className={styles.card}>
            <span className={styles.label}>진행중 이벤트</span>
            <strong>{DASHBOARD_DATA.event.ongoing}</strong>
          </div>

          <div className={styles.card}>
            <span className={styles.label}>활성 쿠폰</span>
            <strong>{DASHBOARD_DATA.coupon.active}</strong>
          </div>
        </div>
      </section>

      {/* 유저 요약 */}
      <section className={styles.section}>
        <h2>유저 현황</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <span className={styles.label}>전체 유저</span>
            <strong>{DASHBOARD_DATA.user.total}</strong>
          </div>

          <div className={styles.card}>
            <span className={styles.label}>ACTIVE</span>
            <strong className={styles.success}>
              {DASHBOARD_DATA.user.active}
            </strong>
          </div>

          <div className={styles.card}>
            <span className={styles.label}>BAN</span>
            <strong className={styles.error}>
              {DASHBOARD_DATA.user.ban}
            </strong>
          </div>

          <div className={styles.card}>
            <span className={styles.label}>SUSPENDED</span>
            <strong className={styles.warning}>
              {DASHBOARD_DATA.user.suspended}
            </strong>
          </div>

          <div className={styles.card}>
            <span className={styles.label}>최근 7일 신규</span>
            <strong>{DASHBOARD_DATA.user.newLast7Days}</strong>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashBoardPage;
