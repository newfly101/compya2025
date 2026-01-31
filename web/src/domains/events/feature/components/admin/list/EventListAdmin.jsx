import React, { useState } from "react";
import { useEventListAdmin } from "@/domains/events/feature/index.js";
import AdminTableLayout from "@/global/layout/adminLayout/AdminTableLayout.jsx";
import EventTableHead from "@/domains/events/feature/components/admin/table/EventTableHead.jsx";
import EventTableBody from "@/domains/events/feature/components/admin/table/EventTableBody.jsx";
import EventEditModal from "@/domains/events/feature/components/admin/modal/EventEditModal.jsx";
import EventCreateModal from "@/domains/events/feature/components/admin/modal/EventCreateModal.jsx";
import { searchFilterUnit, statusFilterUnit, visibleFilterUnit } from "@/core/filters";
import AdminFilterBar from "@/global/layout/adminLayout/AdminFilterBar.jsx";
import { useFilterPipline } from "@/core/filters/hooks/useFilterPipline.js";

const EventListAdmin = () => {
  const { events, changeVisible } = useEventListAdmin();
  const [open, setOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(false);

  const filterUnits = [
    searchFilterUnit,
    statusFilterUnit,
    visibleFilterUnit,
  ];

  const { filters, setFilters, filteredData: filteredEvents }
    = useFilterPipline(events, filterUnits);

  return (
    <>
      <AdminTableLayout
        filters={<AdminFilterBar title={"이벤트"} filters={filters} setFilters={setFilters} filterUnits={filterUnits} action={() => setOpen(true)}/>}
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
