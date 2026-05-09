import CouponModal from "./CouponModal.jsx";
import { useCouponCreate } from "@/domains/coupons/feature/admin/hooks/useCouponCreate.js";

const CouponCreateModal = ({ onClose }) => {
  const hook = useCouponCreate({ onSuccess: onClose });

  return (
    <CouponModal
      title="쿠폰 등록"
      submitLabel="등록"
      form={hook.form}
      onChange={hook.handleChange}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
    />
  );
};

export default CouponCreateModal;
