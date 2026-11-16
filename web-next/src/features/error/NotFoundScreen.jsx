import Link from "next/link";
import styles from "./NotFoundScreen.module.scss";

const NotFoundScreen = () => (
  <div className={styles.screen}>
    <p className={styles.code}>404</p>
    <h1 className={styles.title}>요청하신 페이지를 찾을 수 없습니다</h1>
    <p className={styles.desc}>
      주소가 바뀌었거나 삭제된 페이지일 수 있어요.
      <br />
      아래에서 다른 페이지로 이동해보세요.
    </p>

    <div className={styles.linkList}>
      <Link href="/" className={`${styles.linkItem} ${styles.linkPrimary}`}>홈으로 가기</Link>
      <Link href="/notices" className={styles.linkItem}>공지사항 보기</Link>
      <Link href="/events" className={styles.linkItem}>이벤트 보기</Link>
    </div>
  </div>
);

export default NotFoundScreen;
