import styles from "./BoardTagBadge.module.scss";

// 자유게시판 등 게시판 카테고리 tag 라벨용 (예: "투수 공략", "뉴비 가이드")
// CommunityBadge(공지/신규/인기 = post 상태)와 의미가 달라 별도 컴포넌트로 분리
const BoardTagBadge = ({ label }) => {
  if (!label) return null;
  return <span className={styles.badge}>{label}</span>;
};

export default BoardTagBadge;
