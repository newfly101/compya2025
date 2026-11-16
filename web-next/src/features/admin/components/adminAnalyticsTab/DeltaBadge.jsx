import styles from "./AdminAnalyticsTab.module.scss";

// 증감률 배지 — 개요 카드 순방문자·페이지뷰·이벤트별 건수·세션당 페이지뷰 4곳이 반복해서 쓴다.
// delta 는 analyticsDelta.js 의 deltaOf() 결과: null 이면 "-"(비교 불가), 아니면 {sign, pct}.
const DeltaBadge = ({ delta }) => (
  <span className={delta ? (delta.sign === "up" ? styles.deltaUp : styles.deltaDown) : styles.deltaFlat}>
    {delta ? `${delta.sign === "up" ? "▲" : "▼"}${delta.pct}%` : "-"}
  </span>
);

export default DeltaBadge;
