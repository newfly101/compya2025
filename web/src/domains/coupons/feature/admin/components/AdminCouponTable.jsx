import React from "react";
import CouponCreateModal from "@/domains/coupons/feature/admin/components/modal/CouponCreateModal.jsx";
import AdminTableLayout from "@/global/layout/adminPageLayout/table/AdminTableLayout.jsx";
import CouponTableHead from "@/domains/coupons/feature/admin/components/table/CouponTableHead.jsx";
import CouponTableBody from "@/domains/coupons/feature/admin/components/table/CouponTableBody.jsx";
import AdminFilterBar from "@/global/layout/adminPageLayout/table/AdminFilterBar.jsx";
import CouponEditModal from "@/domains/coupons/feature/admin/components/modal/CouponEditModal.jsx";
import { useAdminCouponTable } from "@/domains/coupons/feature/admin/hooks/useAdminCouponTable.js";
import { useAdminCouponFilter } from "@/domains/coupons/feature/admin/hooks/useAdminCouponFilter.js";

const AdminCouponTable = () => {
  const { coupons, changeVisible } = useAdminCouponTable();
  const { filters, setFilters, filteredData: filteredCoupons }
    = useAdminCouponFilter(coupons);

  const [open, setOpen] = React.useState(false);
  const [editCoupon, setEditCoupon] = React.useState(false);

  return (
    <>
      <AdminTableLayout
        filters={<AdminFilterBar
          title={"쿠폰"}
          filters={filters}
          setFilters={setFilters}
          onCreate={() => setOpen(true)}
        />}
        head={<CouponTableHead />}
        tbody={
          <CouponTableBody
            coupons={filteredCoupons}
            changeVisible={changeVisible}
            setEditCoupon={setEditCoupon}
          />
        }
        tableClass="adminTableCoupon"
      />
      {open && <CouponCreateModal onClose={() => setOpen(false)} />}
      {editCoupon && <CouponEditModal coupon={editCoupon} onClose={() => setEditCoupon(false)} />}
    </>
  );
};

export default AdminCouponTable;
