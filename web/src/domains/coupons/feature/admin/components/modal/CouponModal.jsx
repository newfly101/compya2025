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
  const isMobile = window.innerWidth <= 768;


  return (
    <div className={styles.couponModalWrapper}>
      <div
        className={styles.couponModalOverlay}
        onClick={onCancel}
      />

      <div className={styles.couponModalContainer}>
        <div className={styles.couponModalHeader}>
          <h2 className={styles.couponModalTitle}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.couponModalClose}
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <form
          className={styles.couponModalBody}
          onSubmit={onSubmit}
        >
          <label className={styles.couponModalField}>
            <span className={styles.fieldLabel}>
              쿠폰 코드
            </span>
            <input
              name="couponCode"
              value={form.couponCode}
              onChange={onChange}
              required
            />
          </label>

          <label className={styles.couponModalField}>
            <span className={styles.fieldLabel}>
              쿠폰 제목
            </span>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              required
            />
          </label>

          <label className={styles.couponModalField}>
            <span className={styles.fieldLabel}>
              쿠폰 설명
            </span>
            <textarea
              name="detail"
              value={form.detail}
              onChange={onChange}
              rows={3}
            />
          </label>

          <div className={styles.couponModalRow}>
            {!isMobile &&
            <label className={styles.couponModalField}>
              <span className={styles.fieldLabel}>
                시작일
              </span>
              <input
                type="text"
                inputMode="numeric"
                name="startAt"
                value={form.startAt}
                onChange={onDateTyping}
                onBlur={onDateBlur}
              />
            </label>
            }

            <label className={styles.couponModalField}>
              <span className={styles.fieldLabel}>
                만료일
              </span>
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

          <div className={styles.couponModalActions}>
            <button
              type="button"
              className={styles.couponModalCancel}
              onClick={onCancel}
            >
              취소
            </button>

            <button
              type="submit"
              className={styles.couponModalPrimary}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponModal;
