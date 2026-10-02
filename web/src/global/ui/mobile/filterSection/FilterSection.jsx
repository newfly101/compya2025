import { useId, useState } from "react";
import styles from "./FilterSection.module.scss";

const read = (key, fallback) => {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : v === "1";
  } catch {
    return fallback;
  }
};

/**
 * 접고 펼 수 있는 필터 묶음. 접혀 있으면 헤더에 적용된 필터 요약(summary)과 개수(count)를 보여준다.
 * storageKey 가 있으면 펼침 상태를 localStorage 에 기억한다 (저장소가 막혀 있어도 동작).
 */
const FilterSection = ({ title = "필터", summary, count = 0, storageKey, defaultOpen = true, children }) => {
  const id = useId();
  const [open, setOpen] = useState(() => (storageKey ? read(storageKey, defaultOpen) : defaultOpen));

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, next ? "1" : "0");
    } catch {
      /* 저장 실패는 무시 — 이번 방문에서만 유지 */
    }
  };

  return (
    <section className={styles.section}>
      <button type="button" className={styles.head} aria-expanded={open} aria-controls={id} onClick={toggle}>
        <span className={styles.title}>{title}</span>
        {count > 0 && <span className={styles.badge}>{count}</span>}
        {!open && summary && <span className={styles.summary}>{summary}</span>}
        <span className={styles.chevron} aria-hidden="true" />
      </button>
      <div id={id} className={styles.body} data-open={open || undefined} inert={!open}>
        <div className={styles.inner}>{children}</div>
      </div>
    </section>
  );
};

export default FilterSection;
