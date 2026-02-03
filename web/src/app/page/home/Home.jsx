import styles from "@/app/page/home/Home.module.scss";
import { Link, useNavigate } from "react-router-dom";
import React from "react";
import quizImg from "@/assets/quiz/quiz877.png";
import EventSwiper from "@/domains/events/feature/components/EventSwiper/EventSwiper.jsx";
import CouponSwiper from "@/domains/coupons/feature/components/couponSwiper/CouponSwiper.jsx";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "@/domains/auth/store/slices.js";
import { requestUserLogout } from "@/domains/auth/store/thunks.js";

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, role } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const isLocal = window.location.hostname === "localhost";

  const NAVER_CLIENT_ID = "Ltp6btmLGcZZGgCIxYqv";
  const REDIRECT_URI = isLocal
    ? "http://localhost:8080/api/auth/naver/callback"
    : "https://api.compyafun.com/api/auth/naver/callback";
  const STATE = crypto.randomUUID(); // CSRF 방어용


  const naverLogin = () => {
    const url =
      "https://nid.naver.com/oauth2.0/authorize" +
      "?response_type=code" +
      `&client_id=${NAVER_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&state=${STATE}`;

    window.location.href = url;
  };

  const logout = async () => {
    dispatch(clearUser());
    await dispatch(requestUserLogout());
    window.location.replace("/");
  };

  const handleClick = (url) => {
    navigate(`/${url}`);
  }
  const handleLinkTo = (url) => {
    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };
  return (
    <div className={styles.homePage}>
      <div className={styles.loginWrapper}>
      {!isAuthenticated ?
        <button className={styles.register} onClick={naverLogin}></button>
        :
        <div className={styles.userProfile}>
          <span> {user?.nickName} </span>
          <button className={styles.logout} onClick={logout}>로그아웃</button>
        </div>
      }
      </div>

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
          <div className={styles.card} onClick={() => handleClick("notice")}>공지사항</div>
          {/*<div className={styles.card}>성장 가이드</div>*/}
          <div className={styles.card} onClick={() => handleClick("community")}>커뮤니티</div>
          {/*<div className={styles.card}>덱 구성 가이드</div>*/}
          {/*<div className={styles.card}>플레이 가이드</div>*/}
          <div className={styles.card} onClick={() => handleClick("dictionary")}>📌추천 백과사전</div>
          <div className={styles.card} onClick={() => handleClick("simulate")}>고스변 시뮬레이터</div>
          <div className={styles.card} onClick={() => handleClick("mode/history")}>히스토리 재료 탐색기</div>
          {/*<div className={styles.card} onClick={() => handleLinkTo(CLUB_GUIDE_URL)}>클럽 대전 가이드</div>*/}
        </div>
      </section>

      <section className={styles.homeSection}>
        <div>
          <h2>🎉 컴프야 퀴즈 이벤트 877회 정답</h2>
          <img className={styles.quiz} src={quizImg} alt="quiz-875" />
        </div>
      </section>
      {/* 최신 이벤트 */}
      <section className={styles.homeSection}>
        <div className={styles.subTitle}>
          <h2>🎉 최신 이벤트</h2>
          <span><Link to="/notice?tab=event">전체 보기 →</Link></span>
        </div>
        <EventSwiper short={true}/>
      </section>

      {/* 최신 쿠폰 */}
      <section className={styles.homeSection}>
        <div className={styles.subTitle}>
          <h2>🎁 최신 쿠폰</h2>
          <span><Link to="/notice?tab=coupons">전체 보기 →</Link></span>
        </div>
        <CouponSwiper short={true} />
      </section>

    </div>
  );
}

export default Home;
