import React, { useState } from "react";
import AdminTableLayout from "@/global/layout/adminPageLayout/table/AdminTableLayout.jsx";
import PlayerTableHead from "@/domains/playerCard/feature/admin/components/table/PlayerTableHead.jsx";
import PlayerTableBody from "@/domains/playerCard/feature/admin/components/table/PlayerTableBody.jsx";
import AdminPlayerFilterBar from "@/domains/playerCard/feature/admin/components/filter/AdminPlayerFilterBar.jsx";
import { useAdminPlayerFilter } from "@/domains/playerCard/feature/admin/hooks/useAdminPlayerFilter.js";
import AdminPlayerDrawer from "@/domains/playerCard/feature/admin/components/drawer/AdminPlayerDrawer.jsx";


const createEmptyForm = () => ({
  meta: {
    cardCode: "",
    name: "",
    teamId: "",
    role: "",
    grade: "",
    overall: 0,
    backNumber: 0,
    birthDate: "",
    traits: "",
    positions: "",
    batThrow: "",
    seasonYear: "",
  },
  attributes: {
    accuracy: 0,
    power: 0,
    contact: 0,
    speed: 0,
    defense: 0,
  },
});

const AdminPlayerTable = () => {
  const {filters, setFilters, filteredData:filteredCards} = useAdminPlayerFilter();
  const [drawerMode, setDrawerMode] = useState(null); // CREATE | EDIT | null
  const [form, setForm] = useState(createEmptyForm());

  const [open, setOpen] = useState(false);
  const [editCard, setEditCard] = useState(false);

  const handleCreate = () => {
    setForm(createEmptyForm());
    setDrawerMode("CREATE");
  };

  const handleClose = () => {
    setDrawerMode(null);
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (form.meta[name] !== undefined) {
      setForm((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          [name]: value,
        },
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        attributes: {
          ...prev.attributes,
          [name]: Number(value),
        },
      }));
    }
  };

  const handleSubmit = () => {
    console.log("submit data", form);
    // api 호출
    setDrawerMode(null);
    setOpen(false);
  };

  return (
    <>
      <AdminTableLayout
        filters={<AdminPlayerFilterBar
          title={"선수 카드"}
          filters={filters}
          setFilters={setFilters}
          onCreate={() => setOpen(true)}
        />}
        head={<PlayerTableHead />}
        tbody={
          <PlayerTableBody
            cards={filteredCards}
            setEditCards={setEditCard}
          />
        }
        tableClass="adminTablePlayerCard"
      />
      {open && <AdminPlayerDrawer
        mode={"CREATE"}
        cardForm={form}
        onClose={handleClose}
        onChange={handleChange}
        onSubmit={handleSubmit}
      /> }
    </>
  );
};

export default AdminPlayerTable;
