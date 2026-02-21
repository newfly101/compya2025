import { useDispatch } from "react-redux";
import { useCouponForm } from "@/domains/coupons/feature/admin/hooks/useCouponForm.js";
import { requestAdminInsertNewCoupon } from "@/domains/coupons/store/admin/thunks.js";

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

    await dispatch(requestAdminInsertNewCoupon(formHook.form));
    onSuccess?.();
  };

  return {
    ...formHook,
    handleSubmit,
  }
}
