import styles from "./CommunityList.module.scss";

const EmptyState = ({ message }) => {
  return (
    <div className={styles.emptyState}>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
