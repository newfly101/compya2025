import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { requestGetUserCouponList } from "@/domains/coupons/store/public/thunks.js";
import { formatNow } from "@/global/utils/datetime/dateUtils.js";

export const useCouponList = () => {
  const dispatch = useDispatch();
  // 공개 목록 전용 칸 — 관리자 목록(state.coupon.coupons)에는 숨김 쿠폰이 들어 있다.
  const couponList = useSelector(state => state.coupon.publicCoupons) ?? [];
  const loading = useSelector(state => state.coupon.loading);
  const error = useSelector(state => state.coupon.error);

  useEffect(() => {
    dispatch(requestGetUserCouponList());
  }, [dispatch]);

  const retry = useCallback(() => {
    dispatch(requestGetUserCouponList());
  }, [dispatch]);

  const now = formatNow(new Date());

  return {
    activeCoupon: couponList.filter(c => c.expireAt >= now),
    expiredCoupon: couponList.filter(c => c.expireAt < now),
    loading,
    error,
    retry,
  };
};
