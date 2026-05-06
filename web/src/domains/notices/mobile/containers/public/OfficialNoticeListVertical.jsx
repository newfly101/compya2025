import styles from "./NoticeList.module.scss";
import OfficialNoticeCard from "@/domains/notices/mobile/components/officialNoticeCard/OfficialNoticeCard.jsx";

const OfficialNoticeListVertical = ({ notices = [] }) => {
  return (
    <div className={styles.noticeList}>
      {notices.map(notice => (
        <OfficialNoticeCard key={notice.id} notice={notice} />
      ))}
    </div>
  );
};

export default OfficialNoticeListVertical;
