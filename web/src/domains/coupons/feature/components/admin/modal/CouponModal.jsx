import React from "react";
import styles from "./CouponModal.module.scss";

const CouponModal = ({
                       title,
                       submitLabel,
                       form,
                       onChange,
                       onDateTyping,
                       onDateBlur,
                       onSubmit,
                       onCancel,
                     }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <h2>{title}</h2>
          <button onClick={onCancel}>×</button>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <label>
            쿠폰 코드
            <input
              name="couponCode"
              value={form.couponCode}
              onChange={onChange}
              required
            />
          </label>

          <label>
            쿠폰 제목
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              required
            />
          </label>

          <label>
            쿠폰 설명
            <textarea
              name="detail"
              value={form.detail}
              onChange={onChange}
              rows={3}
            />
          </label>

          <div className={styles.row}>
            <label className={styles.hiddenField}>
              시작일
              <input
                type="text"
                inputMode="numeric"
                name="startAt"
                value={form.startAt}
                onChange={onDateTyping}
                onBlur={onDateBlur}
              />
            </label>

            <label>
              만료일
              <input
                type="text"
                inputMode="numeric"
                name="expireAt"
                value={form.expireAt}
                onChange={onDateTyping}
                onBlur={onDateBlur}
              />
            </label>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={onCancel}
            >
              취소
            </button>
            <button type="submit" className={styles.primary}>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponModal;
