import React, { useState } from "react";
import styles from "./EventListAdmin.module.scss";
import { useEventListAdmin } from "@/domains/events/feature/index.js";
import EventCreateModal from "@/domains/events/feature/components/user/modal/EventCreateModal.jsx";
import AdminTableLayout from "@/global/layout/adminLayout/AdminTableLayout.jsx";
import EventTableHead from "@/domains/events/feature/components/admin/table/EventTableHead.jsx";
import EventTableBody from "@/domains/events/feature/components/admin/table/EventTableBody.jsx";
import EventEditModal from "@/domains/events/feature/components/user/modal/EventEditModal.jsx";

const EventListAdmin = () => {
  const { events, isExpired, changeVisible } = useEventListAdmin();
  const [open, setOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(false);

  return (
    <>
      <AdminTableLayout
        actions={<button className={styles.create} onClick={() => setOpen(true)}>이벤트 등록</button>}
        head={<EventTableHead />}
        tbody={
          <EventTableBody
            events={events}
            isExpired={isExpired}
            changeVisible={changeVisible}
            editEvent={editEvent}
            setEditEvent={setEditEvent}
          />
        }
      />
      {open && <EventCreateModal onClose={() => setOpen(false)} />}
      {editEvent && (<EventEditModal event={editEvent} onClose={() => setEditEvent(false)} />)}
    </>
  );
};

export default EventListAdmin;
