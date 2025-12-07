import styles from "@/styles/pages/Home.module.scss";

const Home = () => {
  return (
    <div className={styles.homePage}>

      {/* Hero Section (상단 그래디언트 영역) */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>컴프야펀</h1>
          <p>컴투스프로야구2025 유저를 위한 종합 정보 사이트</p>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section className={styles.features}>
        <div className={styles.grid}>
          {/*<div className={styles.card}>데미지 계산기</div>*/}
          {/*<div className={styles.card}>스킬트리 계산기</div>*/}
          <div className={styles.card}>이벤트 정보</div>
          <div className={styles.card}>쿠폰 코드</div>
          <div className={styles.card}>성장 가이드</div>
          {/*<div className={styles.card}>커뮤니티</div>*/}
        </div>
      </section>

      {/* 최신 이벤트 */}
      <section className={styles.eventsSection}>
        <h2>최신 이벤트</h2>
        <div className={styles.eventList}>
          <div className={styles.eventCard}>이벤트 1</div>
          <div className={styles.eventCard}>이벤트 2</div>
        </div>
      </section>

      {/* 최신 쿠폰 */}
      <section className={styles.couponSection}>
        <h2>최신 쿠폰</h2>
        <div className={styles.couponList}>
          <div className={styles.couponCard}>쿠폰 1</div>
        </div>
      </section>

    </div>
  );
}

export default Home;
