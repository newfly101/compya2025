import { useDispatch } from "react-redux";
import { useCouponForm } from "@/domains/coupons/feature/admin/hooks/useCouponForm.js";
import { requestAdminUpdateCoupon } from "@/domains/coupons/store/admin/thunks.js";

export const useCouponEdit = ({ coupon, onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = useCouponForm({
    couponCode: coupon.couponCode,
    title: coupon.title,
    detail: coupon.detail,
    expireAt: coupon.expireAt,
    visible: coupon.visible,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = formHook.validate();
    if (!result.valid) {
      alert(result.message);
      return;
    }

    await dispatch(requestAdminUpdateCoupon({
        id: coupon.id,
        ...formHook.form,
      }),
    );

    onSuccess?.();
  };

  return {
    ...formHook,
    handleSubmit,
  };
};
