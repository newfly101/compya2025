import { useId, useState } from "react";
import SearchInput from "@/global/ui/mobile/searchInput/SearchInput.jsx";
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
 * 접고 펼 수 있는 필터 묶음. 기본은 접힘 — 접혀 있으면 헤더에 적용된 필터 요약(summary)과 개수(count)를 보여준다.
 * search({ value, onChange, placeholder }) 를 주면 맨 위에 검색창을 품는다. 검색창은 접혀도 보이고, 검색어도 개수·요약에 센다.
 * collapsible={false} 면 접기 헤더 없이 항상 펼친다. searchActions 는 검색창 오른쪽 버튼 줄 (검색 + 버튼이 한 줄).
 * storageKey 가 있으면 펼침 상태를 localStorage 에 기억한다 (저장소가 막혀 있어도 동작).
 */
const FilterSection = ({ title = "필터", summary, count = 0, storageKey, defaultOpen = false, search, searchActions, collapsible = true, children }) => {
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

  const q = search?.value.trim() ?? "";
  const total = count + (q ? 1 : 0);
  const line = [q && `"${q}"`, summary].filter(Boolean).join(" · ");

  return (
    <section className={styles.section}>
      {search && (
        <div className={styles.searchRow}>
          <SearchInput value={search.value} onChange={search.onChange} placeholder={search.placeholder} />
          {searchActions}
        </div>
      )}
      {!collapsible ? (
        <div className={styles.inner} data-flat>
          {children}
        </div>
      ) : (
        <>
      <button type="button" className={styles.head} aria-expanded={open} aria-controls={id} onClick={toggle}>
        <span className={styles.title}>{title}</span>
        {total > 0 && <span className={styles.badge}>{total}</span>}
        {!open && line && <span className={styles.summary}>{line}</span>}
        <span className={styles.chevron} aria-hidden="true" />
      </button>
      <div id={id} className={styles.body} data-open={open || undefined} inert={!open}>
        <div className={styles.inner}>{children}</div>
      </div>
        </>
      )}
    </section>
  );
};

export default FilterSection;
