import React from "react";
import CouponCreateModal from "@/domains/coupons/feature/components/admin/modal/CouponCreateModal.jsx";
import { useCouponListAdmin } from "@/domains/coupons/feature/hooks/admin/useCouponListAdmin.js";
import AdminTableLayout from "@/global/layout/adminLayout/AdminTableLayout.jsx";
import CouponTableHead from "@/domains/coupons/feature/components/admin/table/CouponTableHead.jsx";
import CouponTableBody from "@/domains/coupons/feature/components/admin/table/CouponTableBody.jsx";
import AdminActionButton from "@/global/layout/adminLayout/AdminActionButton.jsx";

const CouponListAdmin = () => {
  const { coupons, isExpired, changeVisible } = useCouponListAdmin();
  const [open, setOpen] = React.useState(false);
  const [editCoupon, setEditCoupon] = React.useState(false);


  return (
    <>
      <AdminTableLayout
        actions={<AdminActionButton onClick={() => setOpen(true)} actionTitle={"쿠폰 생성"} /> }
        head={<CouponTableHead />}
        tbody={
          <CouponTableBody
            coupons={coupons}
            isExpired={isExpired}
            changeVisible={changeVisible}
            setEditCoupon={setEditCoupon}
          />
        }
      />
      {open && <CouponCreateModal onClose={() => setOpen(false)} />}
      {/*{editCoupon && <CouponEditModal coupons={coupons} onClose={() => setEditCoupon(false)} />}*/}
    </>
  );
};

export default CouponListAdmin;
