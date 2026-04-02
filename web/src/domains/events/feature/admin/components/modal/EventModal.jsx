import React from "react";
import styles from "./EventModal.module.scss";

const EventModal = ({
                      title,
                      submitLabel,
                      form,
                      onChange,
                      onDateTyping,
                      onDateBlur,
                      onSubmit,
                      onCancel,
                      onImageTypeChange,
                      onFileChange
                    }) => {
  return (
    <div className={styles.eventModalWrapper}>
      <div
        className={styles.eventModalOverlay}
        onClick={onCancel}
      />

      <div className={styles.eventModalContainer}>
        <div className={styles.eventModalHeader}>
          <h2 className={styles.eventModalTitle}>{title}</h2>
          <button
            type="button"
            className={styles.eventModalClose}
            onClick={onCancel}
          >
            ×
          </button>
        </div>

        <form
          className={styles.eventModalBody}
          onSubmit={onSubmit}
        >
          <label className={styles.eventModalField}>
            <span className={styles.fieldLabel}>이벤트명</span>
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              required
            />
          </label>

          <label className={styles.eventModalField}>
            <span className={styles.fieldLabel}>이벤트 출처</span>
            <select
              name="eventSource"
              value={form.eventSource}
              onChange={onChange}
            >
              <option value="OFFICIAL">OFFICIAL</option>
              <option value="INTERNAL">INTERNAL</option>
            </select>
          </label>

          <div className={styles.eventModalSwitch}>
            <button
              type="button"
              className={
                form.imageType === "URL"
                  ? `${styles.eventModalSwitchButton} ${styles.eventModalSwitchButtonActive}`
                  : styles.eventModalSwitchButton
              }
              onClick={() => onImageTypeChange("URL")}
            >
              URL 입력
            </button>

            <button
              type="button"
              className={
                form.imageType === "FILE"
                  ? `${styles.eventModalSwitchButton} ${styles.eventModalSwitchButtonActive}`
                  : styles.eventModalSwitchButton
              }
              onClick={() => onImageTypeChange("FILE")}
            >
              파일 업로드
            </button>
          </div>

          {form.imageType === "URL" && (
            <label className={styles.eventModalField}>
              <span className={styles.fieldLabel}>이미지 URL</span>
              <input
                name="imageUrl"
                value={form.imageUrl}
                onChange={onChange}
              />
            </label>
          )}

          {form.imageType === "FILE" && (
            <label className={styles.eventModalField}>
              <span className={styles.fieldLabel}>이미지 파일</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  onFileChange(e.target.files[0])
                }
              />
            </label>
          )}

          {(form.imagePreview || form.imageUrl) && (
            <div className={styles.eventModalPreview}>
              <img src={form.imagePreview || form.imageUrl} alt="preview" />
            </div>
          )}

          <label className={styles.eventModalField}>
            <span className={styles.fieldLabel}>상세 링크 URL</span>
            <input
              name="externalLink"
              value={form.externalLink ?? ""}
              onChange={onChange}
              placeholder="카페 링크 추가"
            />
          </label>

          <div className={styles.eventModalRow}>
            <label className={styles.eventModalField}>
              <span className={styles.fieldLabel}>시작일</span>
              <input
                type="text"
                inputMode="numeric"
                name="startAt"
                value={form.startAt}
                onChange={onDateTyping}
                onBlur={onDateBlur}
              />
            </label>

            <label className={styles.eventModalField}>
              <span className={styles.fieldLabel}>종료일</span>
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

          <div className={styles.eventModalActions}>
            <button
              type="button"
              className={styles.eventModalCancel}
              onClick={onCancel}
            >
              취소
            </button>

            <button
              type="submit"
              className={styles.eventModalPrimary}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
