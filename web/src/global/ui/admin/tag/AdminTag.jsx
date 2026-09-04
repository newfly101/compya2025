import styles from "./AdminTag.module.scss";

// 리스트 주요 셀 / 상태 표시용 배지. 색상 5종을 variant 로 받는다.
// purple(기본 강조) · green(노출/활성/공식) · amber(경고/비활성) · rose(위험/정지) · neutral(중립)
// 도메인 문구는 children 으로 넘긴다 — 컴포넌트에는 도메인 로직 없음.
const AdminTag = ({ variant = "neutral", children }) => {
  return <span className={`${styles.tag} ${styles[variant] ?? styles.neutral}`}>{children}</span>;
};

export default AdminTag;
