// global/ui/mobile/SectionHeader/SectionHeader.jsx
import { Link } from "react-router-dom";
import styles from "./Section.module.scss";

const SectionHeader = ({ title, to, linkText = "전체 보기 →" }) => {
  return (
    <div className={styles.sectionHead}>
      <h2 className={styles.sectionTitle}>
        <span className={styles.accent}>|</span>
        {title}
      </h2>
      {to && (
        <Link to={to} className={styles.more}>{linkText}</Link>
      )}
    </div>
  );
};

export default SectionHeader;
