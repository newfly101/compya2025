import React from "react";
import CouponCreateModal from "@/domains/coupons/feature/components/admin/modal/CouponCreateModal.jsx";
import { useCouponAdminList } from "@/domains/coupons/feature/hooks/admin/useCouponAdminList.js";
import AdminTableLayout from "@/global/layout/adminLayout/AdminTableLayout.jsx";
import CouponTableHead from "@/domains/coupons/feature/components/admin/table/CouponTableHead.jsx";
import CouponTableBody from "@/domains/coupons/feature/components/admin/table/CouponTableBody.jsx";
import AdminFilterBar from "@/global/layout/adminLayout/AdminFilterBar.jsx";
import { useCouponAdminFilter } from "@/domains/coupons/feature/hooks/admin/useCouponAdminFilter.js";
import CouponEditModal from "@/domains/coupons/feature/components/admin/modal/CouponEditModal.jsx";

const CouponListAdmin = () => {
  const { coupons, changeVisible } = useCouponAdminList();
  const { filters, setFilters, filterUnits, filteredData: filteredCoupons }
    = useCouponAdminFilter(coupons);

  const [open, setOpen] = React.useState(false);
  const [editCoupon, setEditCoupon] = React.useState(false);

  return (
    <>
      <AdminTableLayout
        filters={<AdminFilterBar
          title={"쿠폰"}
          filters={filters}
          setFilters={setFilters}
          filterUnits={filterUnits}
          action={() => setOpen(true)}
        />}
        head={<CouponTableHead />}
        tbody={
          <CouponTableBody
            coupons={filteredCoupons}
            changeVisible={changeVisible}
            setEditCoupon={setEditCoupon}
          />
        }
      />
      {open && <CouponCreateModal onClose={() => setOpen(false)} />}
      {editCoupon && <CouponEditModal coupon={editCoupon} onClose={() => setEditCoupon(false)} />}
    </>
  );
};

export default CouponListAdmin;
