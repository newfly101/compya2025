import React from "react";
import styles from "./BoardModal.module.scss";

const BoardModal = ({
                      title,
                      submitLabel,
                      form,
                      onChange,
                      onSubmit,
                      onCancel,
                      onDelete,
                    }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onCancel}>✕</button>
        </div>

        {/* Form */}
        <div className={styles.form}>
          <label>
            게시판 코드
            <input
              name="code"
              value={form.code}
              placeholder="TIP / FREE / CLUB"
              onChange={onChange}
            />
          </label>

          <label>
            게시판 이름
            <input
              name="name"
              value={form.name}
              placeholder="게시판 이름"
              onChange={onChange}
            />
          </label>

          <label>
            게시판 설명
            <input
              name="description"
              value={form.description}
              placeholder="게시판 설명"
              onChange={onChange}
            />
          </label>

          <div className={styles.row}>
            <label>
              작성 권한
              <select
                name="writeRole"
                value={form.writeRole}
                onChange={onChange}
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
                onChange={onChange}
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
                name="visible"
                checked={form.visible}
                onChange={onChange}
              />
              노출 여부
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                name="deleted"
                checked={form.deleted}
                onChange={onChange}
                disabled={onDelete}
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
              onChange={onChange}
            />
          </label>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>
            취소
          </button>
          <button className={styles.primary} onClick={onSubmit}>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardModal;
