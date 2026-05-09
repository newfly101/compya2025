// global/layout/adminPageLayout 폐기 (2026-05-09) — AdminTableLayout / AdminFilterBar wrap 제거. children (head / body / 등록 액션) 만 인라인 유지
import React from "react";
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
      <h2>쿠폰</h2>
      <button type="button" onClick={openCreate}>쿠폰 등록</button>
      <table className="adminTableCoupon">
        <thead>
          <CouponTableHead />
        </thead>
        <tbody>
          <CouponTableBody
            coupons={coupons}
            changeVisible={changeVisible}
            setEditCoupon={openEdit}
          />
        </tbody>
      </table>
      {createOpen && <CouponCreateModal onClose={closeCreate} />}
      {editTarget && <CouponEditModal coupon={editTarget} onClose={closeEdit} />}
    </>
  );
};

export default AdminCouponTable;
