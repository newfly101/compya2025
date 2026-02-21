import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { classifyCoupons } from "@/domains/coupons/feature/public/utils/couponUtils.js";
import { requestGetUserCouponList } from "@/domains/coupons/store/public/thunks.js";

export const useCouponList = () => {
  const dispatch = useDispatch();
  const coupons = useSelector(state => state.coupon.coupons) ?? [];

  useEffect(() => {
    dispatch(requestGetUserCouponList());
  }, [dispatch]);

  const { active, expired } = classifyCoupons(coupons);

  const getLimitedActive = (limit) =>
    limit ? active.slice(0, limit) : active;

  return {
    coupons,
    activeCoupons: active,
    expiredCoupons: expired,
    getLimitedActive,
  };
};
