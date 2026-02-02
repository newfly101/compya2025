import styles from "./CommunityList.module.scss";

const CommunityHeader = ({ board, canWrite, onWrite }) => {
  if (!board) return null;

  return (
    <div className={styles.communityHeader}>
      <h1>{board.name}</h1>
      <p>{board.description}</p>

      {canWrite && (
        <button className={styles.writeBtn} onClick={onWrite}>
          글쓰기
        </button>
      )}
    </div>
  );
};

export default CommunityHeader;
