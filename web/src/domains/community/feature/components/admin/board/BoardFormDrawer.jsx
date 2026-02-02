import styles from "./BoardFormDrawer.module.scss";

const BoardFormDrawer = ({ onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.drawer}>
        <h2>게시판 설정</h2>

        <input placeholder="게시판 이름" />
        <select>
          <option>ADMIN</option>
          <option>USER</option>
        </select>

        <div className={styles.actions}>
          <button onClick={onClose}>취소</button>
          <button className={styles.primary}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default BoardFormDrawer;
