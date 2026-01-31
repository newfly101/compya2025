import React from "react";
import CouponModal from "@/domains/coupons/feature/components/admin/modal/CouponModal.jsx";
import { useCouponEdit } from "@/domains/coupons/feature/hooks/admin/useCouponEdit.js";

const CouponEditModal = ({ coupon, onClose }) => {
  const hook = useCouponEdit({
    coupon,
    onSuccess: onClose,
  });

  return (
    <CouponModal
      title="쿠폰 수정"
      submitLabel="수정"
      form={hook.form}
      onChange={hook.handleChange}
      onDateTyping={hook.handleDateTyping}
      onDateBlur={hook.handleDateBlur}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
      />
  );
};

export default CouponEditModal;
