import React from "react";
import styles from "@/domains/events/feature/admin/components/modal/EventModal.module.scss";

const QuizModal = ({ title, submitLabel, form, onChange, onSubmit, onCancel, onImageTypeChange, onFileChange }) => {
  return (
    <div className={styles.eventModalWrapper}>
      <div className={styles.eventModalOverlay} onClick={onCancel} />

      <div className={styles.eventModalContainer}>
        <div className={styles.eventModalHeader}>
          <h2 className={styles.eventModalTitle}>{title}</h2>
          <button type="button" className={styles.eventModalClose} onClick={onCancel}>×</button>
        </div>

        <form className={styles.eventModalBody} onSubmit={onSubmit}>
          <label className={styles.eventModalField}>
            <span className={styles.fieldLabel}>회차</span>
            <input name="round" type="number" value={form.round} onChange={onChange} required />
          </label>

          <label className={styles.eventModalField}>
            <span className={styles.fieldLabel}>제목</span>
            <input name="title" value={form.title} onChange={onChange} required />
          </label>

          <div className={styles.eventModalSwitch}>
            {["URL", "FILE"].map((type) => (
              <button
                key={type}
                type="button"
                className={`${styles.eventModalSwitchButton} ${form.imageType === type ? styles.eventModalSwitchButtonActive : ""}`}
                onClick={() => onImageTypeChange(type)}
              >
                {type === "URL" ? "URL 입력" : "파일 업로드"}
              </button>
            ))}
          </div>

          {form.imageType === "URL" && (
            <label className={styles.eventModalField}>
              <span className={styles.fieldLabel}>이미지 URL</span>
              <input name="imageUrl" value={form.imageUrl} onChange={onChange} />
            </label>
          )}

          {form.imageType === "FILE" && (
            <label className={styles.eventModalField}>
              <span className={styles.fieldLabel}>이미지 파일</span>
              <input type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files[0])} />
            </label>
          )}

          {(form.imagePreview || form.imageUrl) && (
            <div className={styles.eventModalPreview}>
              <img src={form.imagePreview || form.imageUrl} alt="preview" />
            </div>
          )}

          <div className={styles.eventModalActions}>
            <button type="button" className={styles.eventModalCancel} onClick={onCancel}>취소</button>
            <button type="submit" className={styles.eventModalPrimary}>{submitLabel}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizModal;
