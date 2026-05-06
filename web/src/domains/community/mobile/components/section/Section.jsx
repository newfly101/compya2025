import styles from "./Section.module.scss";

const Section = ({ title, onShowAll, rightText, children }) => (
  <section className={styles.section}>
    <header className={styles.head}>
      <div className={styles.left}>
        <span className={styles.bar} aria-hidden="true" />
        <h2 className={styles.title}>{title}</h2>
      </div>
      {onShowAll ? (
        <button
          type="button"
          className={styles.action}
          onClick={onShowAll}
        >
          전체 보기 →
        </button>
      ) : rightText ? (
        <span className={styles.rightText}>{rightText}</span>
      ) : null}
    </header>
    {children}
  </section>
);

export default Section;
