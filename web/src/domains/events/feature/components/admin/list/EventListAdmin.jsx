import React, { useState } from "react";
import { useEventListAdmin } from "@/domains/events/feature/index.js";
import AdminTableLayout from "@/global/layout/adminLayout/AdminTableLayout.jsx";
import EventTableHead from "@/domains/events/feature/components/admin/table/EventTableHead.jsx";
import EventTableBody from "@/domains/events/feature/components/admin/table/EventTableBody.jsx";
import EventEditModal from "@/domains/events/feature/components/admin/modal/EventEditModal.jsx";
import EventCreateModal from "@/domains/events/feature/components/admin/modal/EventCreateModal.jsx";
import AdminFilterBar from "@/global/layout/adminLayout/AdminFilterBar.jsx";
import { useEventAdminFilter } from "@/domains/events/feature/hooks/admin/useEventAdminFilter.js";

const EventListAdmin = () => {
  const { events, changeVisible } = useEventListAdmin();
  const { filters, setFilters, filterUnits, filteredData: filteredEvents }
    = useEventAdminFilter(events);

  const [open, setOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(false);

  return (
    <>
      <AdminTableLayout
        filters={<AdminFilterBar
          title={"이벤트"}
          filters={filters}
          setFilters={setFilters}
          filterUnits={filterUnits}
          action={() => setOpen(true)}
        />}
        head={<EventTableHead />}
        tbody={
          <EventTableBody
            events={filteredEvents}
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
