import styles from "./LoadMoreButton.module.scss";

// 사이트 공지 / 공식 공지 두 섹션에서 공통으로 쓰는 「더보기」 버튼.
// 남은 개수를 라벨에 보여줘 몇 개가 더 있는지 미리 알린다. remaining 이 0 이면 숨긴다.
const LoadMoreButton = ({ remaining, onClick }) => {
  if (remaining <= 0) return null;

  return (
    <button type="button" className={styles.moreBtn} onClick={onClick}>
      더보기 ({remaining})
    </button>
  );
};

export default LoadMoreButton;
