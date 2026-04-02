import React from "react";
import AdminTableLayout from "@/global/layout/adminPageLayout/table/AdminTableLayout.jsx";
import EventTableHead from "@/domains/events/feature/admin/components/table/EventTableHead.jsx";
import EventTableBody from "@/domains/events/feature/admin/components/table/EventTableBody.jsx";
import EventEditModal from "@/domains/events/feature/admin/components/modal/EventEditModal.jsx";
import EventCreateModal from "@/domains/events/feature/admin/components/modal/EventCreateModal.jsx";
import AdminFilterBar from "@/global/layout/adminPageLayout/table/AdminFilterBar.jsx";
import AdminDefaultFilterControls from "@/global/layout/adminPageLayout/table/AdminDefaultFilterControls.jsx";
import { useAdminEventTable } from "@/domains/events/feature/admin/hooks/useAdminEventTable.js";
import { useAdminEventFilter } from "@/domains/events/feature/admin/hooks/useAdminEventFilter.js";
import { useTableModal } from "@/global/hooks/useTableModal.js";

const AdminEventTable = () => {
  const { events, changeVisible } = useAdminEventTable();
  const { filters, setFilters, filteredData: filteredEvents } = useAdminEventFilter(events);
  const { createOpen, editTarget, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  return (
    <>
      <AdminTableLayout
        filters={
          <AdminFilterBar title={"이벤트"} onCreate={openCreate}>
            <AdminDefaultFilterControls
              filters={filters}
              setFilters={setFilters}
              searchPlaceholder="이벤트명 검색"
            />
          </AdminFilterBar>
        }
        head={<EventTableHead />}
        tbody={
          <EventTableBody
            events={filteredEvents}
            changeVisible={changeVisible}
            setEditEvent={openEdit}
          />
        }
        tableClass="adminTableEvent"
      />
      {createOpen && <EventCreateModal onClose={closeCreate} />}
      {editTarget && <EventEditModal event={editTarget} onClose={closeEdit} />}
    </>
  );
};

export default AdminEventTable;
