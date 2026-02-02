import styles from "./BoardFormDrawer.module.scss";
import { useBoardModal } from "@/domains/community/feature/hooks/useBoardModal.js";



const BoardFormDrawer = ({ onClose, onSubmit }) => {
  const {form, handleChange} = useBoardModal();

  const handleSubmit = () => {
    if (!form.code || !form.name) {
      alert("게시판 코드와 이름은 필수입니다.");
      return;
    }

    onSubmit?.(form);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.wrapper}>
        {/* Header */}
        <div className={styles.header}>
          <h2>게시판 설정</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Form */}
        <div className={styles.form}>
          <label>
            게시판 코드
            <input
              name="code"
              value={form.code}
              placeholder="TIP / FREE / CLUB"
              onChange={handleChange}
            />
          </label>

          <label>
            게시판 이름
            <input
              name="name"
              value={form.name}
              placeholder="게시판 이름"
              onChange={handleChange}
            />
          </label>

          <label>
            게시판 설명
            <input
              name="description"
              value={form.description}
              placeholder="게시판 설명"
              onChange={handleChange}
            />
          </label>

          <div className={styles.row}>
            <label>
              작성 권한
              <select
                name="writeRole"
                value={form.writeRole}
                onChange={handleChange}
              >
                <option value="ADMIN">ADMIN</option>
                <option value="USER">USER</option>
              </select>
            </label>

            <label>
              읽기 권한
              <select
                name="readRole"
                value={form.readRole}
                onChange={handleChange}
              >
                <option value="ALL">ALL</option>
                <option value="LOGIN">LOGIN</option>
              </select>
            </label>
          </div>

          <div className={styles.row}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="isVisible"
                checked={form.isVisible}
                onChange={handleChange}
              />
              노출 여부
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="isDeleted"
                checked={form.isDeleted}
                onChange={handleChange}
                disabled
              />
              삭제 상태
            </label>
          </div>

          <label>
            정렬 순서
            <input
              type="number"
              name="sortOrder"
              value={form.sortOrder}
              onChange={handleChange}
            />
          </label>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onClose}>
            취소
          </button>
          <button className={styles.primary} onClick={handleSubmit}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardFormDrawer;
