import React, { useState } from "react";
import { useEventListAdmin } from "@/domains/events/feature/index.js";
import EventCreateModal from "@/domains/events/feature/components/admin/modal/EventCreateModal.jsx";
import AdminTableLayout from "@/global/layout/adminLayout/AdminTableLayout.jsx";
import EventTableHead from "@/domains/events/feature/components/admin/table/EventTableHead.jsx";
import EventTableBody from "@/domains/events/feature/components/admin/table/EventTableBody.jsx";
import EventEditModal from "@/domains/events/feature/components/admin/modal/EventEditModal.jsx";
import AdminActionButton from "@/global/layout/adminLayout/AdminActionButton.jsx";

const EventListAdmin = () => {
  const { events, isExpired, changeVisible } = useEventListAdmin();
  const [open, setOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(false);

  return (
    <>
      <AdminTableLayout
        actions={<AdminActionButton onClick={() => setOpen(true)} actionTitle={"이벤트 등록"} /> }
        head={<EventTableHead />}
        tbody={
          <EventTableBody
            events={events}
            isExpired={isExpired}
            changeVisible={changeVisible}
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
