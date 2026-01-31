import { useDispatch, useSelector } from "react-redux";
import { splitCouponsByExpired } from "@/domains/events/utils/EventDateUtils.js";
import { useEffect } from "react";
import { requestGetCouponList } from "@/domains/coupons/store/index.js";

export const useCouponListUser = () => {
  const dispatch = useDispatch();
  const { coupons } = useSelector(state => state.coupon);

  const { activeCoupons, expireCoupons } = splitCouponsByExpired(coupons);

  useEffect(() => {
    dispatch(requestGetCouponList());
  }, [dispatch]);

  const shortCoupons = (limit) => {
    return {activeCoupons: limit ? activeCoupons.slice(0, limit) : activeCoupons};
  }

  return {
    coupons: coupons ?? [],
    activeCoupons,
    expireCoupons,
    shortCoupons,
  }
}
