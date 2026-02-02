import React from "react";
import styles from "./TagModal.module.scss";

const TagModal = ({
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
          <div className={styles.row}>
          <label>
            태그 코드
            <input
              name="code"
              value={form.code}
              placeholder="CODE"
              onChange={onChange}
            />
          </label>

          <label>
            태그 이름
            <input
              name="name"
              value={form.name}
              placeholder="태그 이름"
              onChange={onChange}
            />
          </label>
          </div>

          <label>
            태그 설명
            <textarea
              name="description"
              value={form.description}
              placeholder="태그 설명"
              onChange={onChange}
              rows={3}
            />
          </label>

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

export default TagModal;
