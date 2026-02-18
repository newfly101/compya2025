import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { requestUserLogout } from "@/domains/auth/store/thunks.js";
import { clearUser } from "@/domains/auth/store/slices.js";

export default function Header() {
  const { isAuthenticated, user, authority } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const NAVER_CLIENT_ID = "Ltp6btmLGcZZGgCIxYqv";
  const isLocal = window.location.hostname === "localhost";

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

  return (
    <header className={styles.header}>
      <div className={styles.headerBar}>
        <div className={styles.inner}>

          <div className={styles.navGroup}>
            <nav className={styles.nav}>
              <Link to="/">홈</Link>
              {/*<Link to="/damage">데미지 계산기</Link>*/}
              {/*<Link to="/skill">스킬 계산기</Link>*/}
              <Link to="/notice?tab=events">이벤트</Link>
              <Link to="/notice?tab=coupons">쿠폰 코드</Link>
              <Link to="/notice">공지사항</Link>
              <Link to="/community">커뮤니티</Link>
              <Link to="/dictionary">📌추천 백과사전</Link>
              {isAuthenticated &&
                <Link to="/mypage">마이페이지</Link>
              }
              {authority?.role === "ADMIN" &&
                <Link to="/admin/users">유저 관리</Link>
              }
            </nav>
          </div>

          <div className={styles.actionGroup}>
            {!isAuthenticated ? (
              <button className={styles.register} onClick={naverLogin}></button>
            ) : (
              <div className={styles.userProfile}>
                <span>{user?.nickName}</span>
                <button className={styles.logout} onClick={logout}>로그아웃</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
