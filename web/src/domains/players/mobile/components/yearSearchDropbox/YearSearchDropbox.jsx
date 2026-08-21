// domains/players/mobile/components/yearSearchDropbox/YearSearchDropbox.jsx
// 연도 검색 가능 드롭다운 — 2자리 약식 입력을 4자리로 매칭한다.
// 데이터 범위 1982~2026(45종) 실측 검증: 2자리 접미사 충돌 없음 (82~99→19xx, 00~26→20xx).
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./YearSearchDropbox.module.scss";

// 2자리 입력 → 4자리 연도. 4자리 입력은 그대로. 그 외는 null.
function toFullYear(raw) {
  const trimmed = raw.trim();
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  if (/^\d{2}$/.test(trimmed)) {
    const n = Number(trimmed);
    return n >= 82 ? `19${trimmed}` : `20${trimmed}`;
  }
  return null;
}

function filterOptions(options, rawInput) {
  const trimmed = rawInput.trim();
  if (!trimmed) return options;
  const exact = toFullYear(trimmed);
  return options.filter((opt) => opt.label.includes(trimmed) || (exact !== null && opt.label === exact));
}

const YearSearchDropbox = ({ years, activeYearKey, onSelect }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const wrapRef = useRef(null);

  // 옵션 표기는 항상 4자리 full year. 레전드는 맨 위 고정.
  const options = useMemo(
    () =>
      years.map((y) => ({
        key: y.year === null ? "legend" : String(y.year),
        label: y.year === null ? "레전드" : String(y.year),
        count: y.count,
      })),
    [years]
  );

  const selectedOption = options.find((o) => o.key === activeYearKey) ?? null;

  // 입력창은 검색어 전용 — 선택된 연도는 여기 채워 넣지 않는다(닫혀 있을 때는 항상 빈 값).
  // 현재 선택은 placeholder(닫힘) + 목록 강조(열림) 로만 보여준다.
  useEffect(() => {
    if (!open) return undefined;
    const handleOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const filtered = useMemo(() => filterOptions(options, inputValue), [options, inputValue]);

  const handleSelect = (opt) => {
    setInputValue("");
    setOpen(false);
    onSelect(opt.key);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && filtered.length > 0) {
      e.preventDefault();
      handleSelect(filtered[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setInputValue("");
    }
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.inputBox}>
        <input
          className={styles.input}
          placeholder={selectedOption ? selectedOption.label : "연도 검색 (예: 96 → 1996)"}
          value={inputValue}
          onFocus={() => {
            setInputValue(""); // 열 때마다 검색어 초기화 — 이전 값에 필터링되어 갇히는 결함 방지
            setOpen(true);
          }}
          onChange={(e) => {
            setInputValue(e.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
        <span className={styles.caret} aria-hidden="true">
          ▾
        </span>
      </div>

      {open && (
        <div className={styles.optionList}>
          {filtered.length === 0 ? (
            <div className={styles.optionEmpty}>일치하는 연도가 없습니다.</div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.key}
                type="button"
                className={`${styles.option} ${opt.key === activeYearKey ? styles.optionActive : ""}`}
                onClick={() => handleSelect(opt)}
              >
                <span className={styles.optionLabel}>{opt.label}</span>
                <span className={styles.optionCount}>{opt.count}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default YearSearchDropbox;
