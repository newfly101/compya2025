// global/ui/mobile/SectionBlock/SectionBlock.jsx
import SectionHeader from "./SectionHeader.jsx";
import styles from "./Section.module.scss";

const SectionBlock = ({ title, to, linkText, children }) => {
  return (
    <section className={styles.section}>
      <SectionHeader title={title} to={to} linkText={linkText} />
      {children}
    </section>
  );
};

export default SectionBlock;
