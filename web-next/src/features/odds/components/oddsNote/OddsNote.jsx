import styles from "./OddsNote.module.scss";

// note 항목 — 문자열이면 그대로, 객체({text, href})면 새 탭 외부 링크로 렌더
const NoteItemContent = ({ item }) => {
  if (typeof item === "string") return item;
  if (item?.href) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.noteLink}>
        {item.text}
        <span aria-hidden="true"> ↗</span>
      </a>
    );
  }
  return item?.text ?? "";
};

// note / text / link 블록 렌더 — 표 사이 법적 고지/주석/외부 링크는 배열 순서 그대로 노출
const OddsNote = ({ block }) => {
  if (block.type === "note") {
    const items = block.items ?? [];
    if (items.length === 0) return null;

    return (
      <ul className={styles.noteList}>
        {items.map((item, i) => (
          <li key={i} className={styles.noteItem}>
            <NoteItemContent item={item} />
          </li>
        ))}
      </ul>
    );
  }

  if (block.type === "text") {
    if (!block.value) return null;
    return <p className={styles.text}>{block.value}</p>;
  }

  // 이 문서에 없는 확률표로 나가는 외부 링크 — 새 탭, 시각 단서 아이콘
  if (block.type === "link") {
    if (!block.href) return null;
    return (
      <a href={block.href} target="_blank" rel="noopener noreferrer" className={styles.linkBlock}>
        <span className={styles.linkText}>{block.text}</span>
        <span className={styles.linkIcon} aria-hidden="true">↗</span>
      </a>
    );
  }

  return null;
};

export default OddsNote;
