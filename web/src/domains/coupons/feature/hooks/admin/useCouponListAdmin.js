import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { requestGetCouponList, requestUpdateCouponVisible } from "@/domains/coupons/store/index.js";
import { VisibleToggleHandler } from "@/global/handler/VisibleToggleHandler.js";

export const useCouponListAdmin = () => {
  const dispatch = useDispatch();
  const { coupons, loading, error } = useSelector((state) => state.coupon);

  useEffect(() => {
    dispatch(requestGetCouponList());
  }, [dispatch]);

  const changeVisible = VisibleToggleHandler(dispatch, requestUpdateCouponVisible);

  return {
    coupons,
    changeVisible,
    loading,
    error,
  };
};
