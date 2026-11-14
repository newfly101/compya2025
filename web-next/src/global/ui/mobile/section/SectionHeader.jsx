// global/ui/mobile/SectionHeader/SectionHeader.jsx
import Link from "next/link";
import styles from "./Section.module.scss";

const SectionHeader = ({ title, to, linkText = "전체 보기 →" }) => {
  return (
    <div className={styles.sectionHead}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.accent}>|</span>
        {title}
      </h2>
      {to && (
        <Link href={to} className={styles.more}>{linkText}</Link>
      )}
    </div>
  );
};

export default SectionHeader;
