import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { requestGetUserCouponList } from "@/domains/coupons/store/public/thunks.js";
import { formatNow } from "@/global/utils/datetime/dateUtils.js";

export const useCouponList = () => {
  const dispatch = useDispatch();
  const couponList = useSelector(state => state.coupon.coupons) ?? [];

  useEffect(() => {
    dispatch(requestGetUserCouponList());
  }, [dispatch]);

  const now = formatNow(new Date());

  return {
    activeCoupon: couponList.filter(c => c.expireAt >= now),
    expiredCoupon: couponList.filter(c => c.expireAt < now),
  };
};
