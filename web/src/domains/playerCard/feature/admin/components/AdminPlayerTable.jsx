import React from "react";
import AdminTableLayout from "@/global/layout/adminPageLayout/table/AdminTableLayout.jsx";
import PlayerTableHead from "@/domains/playerCard/feature/admin/components/table/PlayerTableHead.jsx";
import PlayerTableBody from "@/domains/playerCard/feature/admin/components/table/PlayerTableBody.jsx";
import AdminPlayerFilterBar from "@/domains/playerCard/feature/admin/components/filter/AdminPlayerFilterBar.jsx";
import { useAdminPlayerFilter } from "@/domains/playerCard/feature/admin/hooks/useAdminPlayerFilter.js";
import AdminPlayerDrawer from "@/domains/playerCard/feature/admin/components/drawer/AdminPlayerDrawer.jsx";
import { useAdminPlayerForm } from "@/domains/playerCard/feature/admin/hooks/useAdminPlayerForm.js";


const AdminPlayerTable = () => {
  const { filters, setFilters, filteredData: filteredCards } = useAdminPlayerFilter();
  const {
    formState,
    formActions,
    formState: { open },
    formActions: { handleCreate, handleEdit },
  } = useAdminPlayerForm();

  return (
    <>
      <AdminTableLayout
        filters={<AdminPlayerFilterBar
          title={"선수 카드"}
          filters={filters}
          setFilters={setFilters}
          onCreate={handleCreate}
        />}
        head={<PlayerTableHead />}
        tbody={
          <PlayerTableBody
            cards={filteredCards}
            setEditCards={handleEdit}
          />
        }
        tableClass="adminTablePlayerCard"
      />
      {open && <AdminPlayerDrawer
        formState={formState}
        formActions={formActions}
        mode={"CREATE"}
      />}
    </>
  );
};

export default AdminPlayerTable;
