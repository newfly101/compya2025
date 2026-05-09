import CouponModal from "./CouponModal.jsx";
import { useCouponEdit } from "@/domains/coupons/feature/admin/hooks/useCouponEdit.js";

const CouponEditModal = ({ coupon, onClose }) => {
  const hook = useCouponEdit({ coupon, onSuccess: onClose });

  return (
    <CouponModal
      title="쿠폰 수정"
      submitLabel="수정"
      form={hook.form}
      onChange={hook.handleChange}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
    />
  );
};

export default CouponEditModal;
