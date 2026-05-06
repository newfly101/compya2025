import styles from "./NoticeList.module.scss";
import NoticeCard from "@/domains/notices/mobile/components/noticeCard/NoticeCard.jsx";

const NoticeListVertical = ({ notices = [] }) => {
  return (
    <div className={styles.noticeList}>
      {notices.map(notice => (
        <NoticeCard key={notice.id} notice={notice} />
      ))}
    </div>
  );
};

export default NoticeListVertical;
