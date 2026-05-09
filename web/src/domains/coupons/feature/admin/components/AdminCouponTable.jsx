import React from "react";
import AdminTableLayout from "@/global/layout/adminPageLayout/table/AdminTableLayout.jsx";
import AdminFilterBar from "@/global/layout/adminPageLayout/table/AdminFilterBar.jsx";
import { useAdminCouponTable } from "@/domains/coupons/feature/admin/hooks/useAdminCouponTable.js";
import { useTableModal } from "@/global/hooks/useTableModal.js";
import CouponTableHead from "./table/CouponTableHead.jsx";
import CouponTableBody from "./table/CouponTableBody.jsx";
import CouponCreateModal from "./modal/CouponCreateModal.jsx";
import CouponEditModal from "./modal/CouponEditModal.jsx";

const AdminCouponTable = () => {
  const { coupons, changeVisible } = useAdminCouponTable();
  const { createOpen, editTarget, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  return (
    <>
      <AdminTableLayout
        filters={<AdminFilterBar title="쿠폰" onCreate={openCreate} />}
        head={<CouponTableHead />}
        tbody={
          <CouponTableBody
            coupons={coupons}
            changeVisible={changeVisible}
            setEditCoupon={openEdit}
          />
        }
        tableClass="adminTableCoupon"
      />
      {createOpen && <CouponCreateModal onClose={closeCreate} />}
      {editTarget && <CouponEditModal coupon={editTarget} onClose={closeEdit} />}
    </>
  );
};

export default AdminCouponTable;
