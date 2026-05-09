import { useCouponForm } from "./useCouponForm.js";
import { requestAdminUpdateCoupon } from "@/domains/coupons/store/admin/thunks.js";

const toInputDatetime = (value) =>
  value ? String(value).replace(" ", "T").slice(0, 16) : "";

export const useCouponEdit = ({ coupon, onSuccess }) =>
  useCouponForm({
    initialForm: {
      couponCode: coupon.couponCode ?? "",
      title: coupon.title ?? "",
      detail: coupon.detail ?? "",
      expireAt: toInputDatetime(coupon.expireAt),
      visible: coupon.visible ?? true,
    },
    submitThunk: requestAdminUpdateCoupon,
    onSuccess,
    couponId: coupon.id,
  });
