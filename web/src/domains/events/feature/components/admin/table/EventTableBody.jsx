import styles from "./EventTable.module.scss";
import EventVisibilityToggle from "@/domains/events/feature/components/user/support/EventVisibilityToggle.jsx";
import React from "react";
import { EVENT_TABLE } from "@/domains/events/config/eventTable.config.js";

const EventTableBody = ({ events, isExpired, setEditEvent, changeVisible }) => {

  if (events.length === 0) {
    return (
      <tr>
        <td colSpan={EVENT_TABLE.length} className={styles.empty}>
          등록된 이벤트가 없습니다.
        </td>
      </tr>
    );
  }

  return (
    events.map(e => (
      <tr key={e.id}>
        <td>{e.id}</td>
        <td>{e.title}</td>
        <td><img src={e.imageUrl} alt={`event-${e.id}`} className={styles.thumbnail} /></td>
        <td><a href={e.externalLink} target="_blank" rel="noreferrer"> 카페링크 </a></td>
        <td>{e.startAt} ~ {e.expireAt}</td>
        <td>{!isExpired ? "진행중" : "종료"}</td>
        <td><EventVisibilityToggle visible={e.visible} onChange={changeVisible(e.id)} /></td>
        <td className={styles.actions}>
          <button onClick={() => setEditEvent(e)}>수정</button>
          <button className={styles.danger}>비공개</button>
        </td>
      </tr>
    ))
  );
};

export default EventTableBody;
