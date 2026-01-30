import React, { useState } from "react";
import styles from "./EventListAdmin.module.scss";
import { useEventListAdmin } from "@/domains/events/feature/index.js";
import EventCreateModal from "@/domains/events/feature/components/user/modal/EventCreateModal.jsx";
import EventEditModal from "@/domains/events/feature/components/user/modal/EventEditModal.jsx";
import EventVisibilityToggle from "@/domains/events/feature/components/user/support/EventVisibilityToggle.jsx";

const EVENT_COLUMNS = [
  { key: "id", label: "ID" },
  { key: "title", label: "이벤트명" },
  { key: "imageUrl", label: "이미지경로" },
  { key: "externalLink", label: "카페링크" },
  { key: "period", label: "기간" },
  { key: "status", label: "상태" },
  { key: "visible", label: "노출" },
  { key: "actions", label: "액션" },
];

const EventListAdmin = () => {
  const { events, nowDate, handleVisibleChange } = useEventListAdmin();
  const [open, setOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(false);

  const hasEvents = events.length > 0;

  return (
    <div className={styles.wrapper}>
      <button className={styles.create} onClick={() => setOpen(true)}>이벤트 등록</button>

      <table className={styles.table}>
        <thead>
        <tr>
          {EVENT_COLUMNS.map(col => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
        </thead>
        <tbody>
        {!hasEvents && (
          <tr>
            <td colSpan={8} className={styles.empty}>
              등록된 이벤트가 없습니다.
            </td>
          </tr>
        )}

        {hasEvents && events.map(e => {
          const isExpired = new Date(e.expireAt) <= nowDate;
          return (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.title}</td>
              <td><img src={e.imageUrl} alt={`event-${e.id}`} className={styles.thumbnail} /></td>
              <td><a href={e.externalLink} target="_blank" rel="noreferrer"> 카페링크 </a></td>
              <td>{e.startAt} ~ {e.expireAt}</td>
              <td>{!isExpired ? "진행중" : "종료"}</td>
              <td><EventVisibilityToggle visible={e.visible} onChange={handleVisibleChange(e.id)}/></td>
              <td className={styles.actions}>
                <button onClick={() => setEditEvent(e)}>수정</button>

                {editEvent && (
                  <EventEditModal
                    event={editEvent}
                    onClose={() => setEditEvent(false)}
                  />
                )}
                <button className={styles.danger}>비공개</button>
              </td>
            </tr>
          );
        })
        }
        </tbody>
      </table>

      {open && <EventCreateModal onClose={() => setOpen(false)} />}
    </div>
  );
};

export default EventListAdmin;
