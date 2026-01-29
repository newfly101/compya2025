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
            이벤트명
            <input
              name="title"
              value={form.title}
              onChange={onChange}
              required
            />
          </label>

          <label>
            이벤트 출처
            <select
              name="eventSource"
              value={form.eventSource}
              onChange={onChange}
            >
              <option value="OFFICIAL">OFFICIAL</option>
              <option value="INTERNAL">INTERNAL</option>
            </select>
          </label>

          <label>
            이미지 URL
            <input
              name="imageUrl"
              value={form.imageUrl}
              onChange={onChange}
            />
          </label>

          <label>
            외부 링크
            <input
              name="externalLink"
              value={form.externalLink}
              onChange={onChange}
            />
          </label>

          <div className={styles.row}>
            <label>
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
              종료일
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

export default EventModal;
