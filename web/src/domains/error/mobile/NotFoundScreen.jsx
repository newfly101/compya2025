// src/domains/error/mobile/NotFoundScreen.jsx
// 404 라우트("*") + 라우터 errorElement 공용 fallback 화면.
// errorElement 로 쓰일 땐 AppWrapper(TopBarProvider) 자체가 실패했을 수 있으므로
// useTopBar() 가 null 이어도 죽지 않도록 방어한다 — useDomainTopBar() 는 여기서 쓰지 않는다.

import { useEffect } from "react";
import { useTopBar } from "@/app/provider/TopBarProvider";
import styles from "./NotFoundScreen.module.scss";

const NotFoundScreen = () => {
  const topBar = useTopBar();

  useEffect(() => {
    if (!topBar) return;
    topBar.setConfig({
      variant: "section",
      title: "페이지를 찾을 수 없음",
      rightAction: null,
      onBack: null,
      onBurger: null,
    });

    return () => {
      topBar.setConfig({ variant: "home", title: null, rightAction: null, onBack: null, onBurger: null });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.screen}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>요청하신 페이지를 찾을 수 없습니다</h1>
      <p className={styles.desc}>
        주소가 바뀌었거나 삭제된 페이지일 수 있어요.
        <br />
        아래에서 다른 페이지로 이동해보세요.
      </p>

      <div className={styles.linkList}>
        <a href="/" className={`${styles.linkItem} ${styles.linkPrimary}`}>홈으로 가기</a>
        <a href="/notices" className={styles.linkItem}>공지사항 보기</a>
        <a href="/events" className={styles.linkItem}>이벤트 보기</a>
      </div>
    </div>
  );
};

export default NotFoundScreen;
