import { useCouponForm } from "./useCouponForm.js";
import { requestAdminInsertNewCoupon } from "@/domains/coupons/store/admin/thunks.js";

export const useCouponCreate = ({ onSuccess }) =>
  useCouponForm({
    initialForm: {
      couponCode: "",
      title: "",
      detail: "",
      expireAt: "",
      visible: true,
    },
    submitThunk: requestAdminInsertNewCoupon,
    onSuccess,
  });
