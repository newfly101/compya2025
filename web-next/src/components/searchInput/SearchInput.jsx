import styles from "./SearchInput.module.scss";

/** 공용 검색 입력 (돋보기 · 지우기 버튼). FilterSection 의 검색과 선호 모달이 같은 모양을 쓴다 */
const SearchInput = ({ value, onChange, placeholder = "레전드 이름 검색" }) => (
  <div className={styles.search}>
    <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="7" cy="7" r="4.6" />
      <path d="M10.6 10.6 L14 14" strokeLinecap="round" />
    </svg>
    <input type="search" value={value} placeholder={placeholder} autoComplete="off" onChange={(e) => onChange(e.target.value)} />
    {value && (
      <button type="button" aria-label="검색어 지우기" onClick={() => onChange("")}>
        ×
      </button>
    )}
  </div>
);

export default SearchInput;
