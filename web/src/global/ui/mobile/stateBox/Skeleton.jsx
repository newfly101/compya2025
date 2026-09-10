import styles from "./Skeleton.module.scss";

// 목록형 화면이 로딩 중 보여줄 단순 골격. count 개 만큼 height(px) 막대를 반복한다.
const Skeleton = ({ count = 3, height = 16 }) => (
  <div className={styles.wrap} aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.bar} style={{ height }} />
    ))}
  </div>
);

export default Skeleton;
