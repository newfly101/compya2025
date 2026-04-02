import React from "react";
import CouponCreateModal from "@/domains/coupons/feature/admin/components/modal/CouponCreateModal.jsx";
import AdminTableLayout from "@/global/layout/adminPageLayout/table/AdminTableLayout.jsx";
import CouponTableHead from "@/domains/coupons/feature/admin/components/table/CouponTableHead.jsx";
import CouponTableBody from "@/domains/coupons/feature/admin/components/table/CouponTableBody.jsx";
import AdminFilterBar from "@/global/layout/adminPageLayout/table/AdminFilterBar.jsx";
import AdminDefaultFilterControls from "@/global/layout/adminPageLayout/table/AdminDefaultFilterControls.jsx";
import CouponEditModal from "@/domains/coupons/feature/admin/components/modal/CouponEditModal.jsx";
import { useAdminCouponTable } from "@/domains/coupons/feature/admin/hooks/useAdminCouponTable.js";
import { useAdminCouponFilter } from "@/domains/coupons/feature/admin/hooks/useAdminCouponFilter.js";
import { useTableModal } from "@/global/hooks/useTableModal.js";

const AdminCouponTable = () => {
  const { coupons, changeVisible } = useAdminCouponTable();
  const { filters, setFilters, filteredData: filteredCoupons } = useAdminCouponFilter(coupons);
  const { createOpen, editTarget, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  return (
    <>
      <AdminTableLayout
        filters={
          <AdminFilterBar title={"쿠폰"} onCreate={openCreate}>
            <AdminDefaultFilterControls
              filters={filters}
              setFilters={setFilters}
              searchPlaceholder="쿠폰 코드 검색"
            />
          </AdminFilterBar>
        }
        head={<CouponTableHead />}
        tbody={
          <CouponTableBody
            coupons={filteredCoupons}
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
