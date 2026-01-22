import { Link } from "react-router-dom";
import styles from "@/shared/layout/appLayout/appLayout.module.scss";
import { useEffect } from "react";

export default function Header() {

  const NAVER_CLIENT_ID = "Ltp6btmLGcZZGgCIxYqv";
  const REDIRECT_URI = "https://api.compyafun.com/api/auth/naver/callback";
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

  const login_success = localStorage.getItem("accessToken");

  const logout = () => {
    localStorage.removeItem("accessToken");
    window.location.replace("/");
  }


  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      localStorage.setItem("accessToken", token);
      window.location.replace("/");
    }
  }, []);



  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <nav className={styles.nav}>
          <Link to="/" >홈</Link>
          {/*<Link to="/damage">데미지 계산기</Link>*/}
          {/*<Link to="/skill">스킬 계산기</Link>*/}
          <Link to="/notice?tab=event">이벤트</Link>
          <Link to="/notice?tab=coupons">쿠폰 코드</Link>
          <Link to="/notice">공지사항</Link>
          <Link to="/tips">팁 모아보기</Link>
          <Link to="/dictionary">📌추천 백과사전</Link>
        </nav>
        {login_success ?
          <button className={styles.register} onClick={logout}>로그아웃</button>
          :
          <button className={styles.register} onClick={naverLogin}>네이버 로그인</button>
        }
      </div>
    </header>
  );
}
