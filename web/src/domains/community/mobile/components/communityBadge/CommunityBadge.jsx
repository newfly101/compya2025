import PinnedBadge from "@/global/ui/badge/PinnedBadge.jsx";
import styles from "./CommunityBadge.module.scss";

const CommunityBadge = ({ kind }) => {
  if (kind === "new") {
    return <span className={styles.newBadge}>신규</span>;
  }
  if (kind === "notice") {
    return <PinnedBadge variant="important" label="공지" />;
  }
  if (kind === "hot") {
    return <PinnedBadge variant="mustread" label="인기" />;
  }
  return null;
};

export default CommunityBadge;
