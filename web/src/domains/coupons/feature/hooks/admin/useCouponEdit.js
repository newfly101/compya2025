import { useDispatch } from "react-redux";
import { useCouponForm } from "@/domains/coupons/feature/hooks/admin/internal/useCouponForm.js";
import { requestUpdateCoupon } from "@/domains/coupons/store/index.js";

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

    await dispatch(requestUpdateCoupon({
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
