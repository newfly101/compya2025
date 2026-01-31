import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { requestGetCouponList, requestUpdateCouponVisible } from "@/domains/coupons/store/index.js";
import { VisibleToggleHandler } from "@/global/handler/VisibleToggleHandler.js";
import { dateUtils } from "@/global/utils/datetime/dateUtils.js";

export const useCouponListAdmin = () => {
  const dispatch = useDispatch();
  const { coupons, loading, error } = useSelector((state) => state.coupon);
  const isExpired = dateUtils.expired(coupons.expireAt);

  useEffect(() => {
    dispatch(requestGetCouponList());
  }, [dispatch]);

  const changeVisible = VisibleToggleHandler(dispatch, requestUpdateCouponVisible);

  return {
    coupons,
    isExpired,
    changeVisible,
    loading,
    error,
  };
};
