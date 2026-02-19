import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { requestGetCouponList } from "@/domains/coupons/store/index.js";
import { classifyCoupons } from "@/domains/coupons/feature/list/public/utils/couponUtils.js";

export const useCouponList = () => {
  const dispatch = useDispatch();
  const coupons = useSelector(state => state.coupon.coupons) ?? [];

  useEffect(() => {
    dispatch(requestGetCouponList());
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
