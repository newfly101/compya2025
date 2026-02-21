import React, { useState } from "react";
import AdminTableLayout from "@/global/layout/adminPageLayout/table/AdminTableLayout.jsx";
import EventTableHead from "@/domains/events/feature/admin/components/table/EventTableHead.jsx";
import EventTableBody from "@/domains/events/feature/admin/components/table/EventTableBody.jsx";
import EventEditModal from "@/domains/events/feature/admin/components/modal/EventEditModal.jsx";
import EventCreateModal from "@/domains/events/feature/admin/components/modal/EventCreateModal.jsx";
import AdminFilterBar from "@/global/layout/adminPageLayout/table/AdminFilterBar.jsx";
import { useAdminEventTable } from "@/domains/events/feature/admin/hooks/useAdminEventTable.js";
import { useAdminEventFilter } from "@/domains/events/feature/admin/hooks/useAdminEventFilter.js";

const AdminEventTable = () => {
  const { events, changeVisible } = useAdminEventTable();
  const { filters, setFilters, filteredData: filteredEvents }
    = useAdminEventFilter(events);

  const [open, setOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(false);

  return (
    <>
      <AdminTableLayout
        filters={<AdminFilterBar
          title={"이벤트"}
          filters={filters}
          setFilters={setFilters}
          onCreate={() => setOpen(true)}
        />}
        head={<EventTableHead />}
        tbody={
          <EventTableBody
            events={filteredEvents}
            changeVisible={changeVisible}
            setEditEvent={setEditEvent}
          />
        }
        tableClass="adminTableEvent"
      />
      {open && <EventCreateModal onClose={() => setOpen(false)} />}
      {editEvent && (<EventEditModal event={editEvent} onClose={() => setEditEvent(false)} />)}
    </>
  );
};

export default AdminEventTable;
