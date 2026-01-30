import { useDispatch } from "react-redux";
import { useCouponForm } from "@/domains/coupons/feature/hooks/admin/internal/useCouponForm.js";
import { requestInsertNewCoupon } from "@/domains/coupons/store/index.js";

export const useCouponCreate = ({onSuccess}) => {
  const dispatch = useDispatch();

  const formHook = useCouponForm({
    couponCode: "",
    title: "",
    detail: "",
    expireAt: "",
    visible: true,
  })

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = formHook.validate();
    if (!result.valid) {
      alert(result.message);
      return;
    }

    await dispatch(requestInsertNewCoupon(formHook.form));
    onSuccess?.();
  };

  return {
    ...formHook,
    handleSubmit,
  }
}
