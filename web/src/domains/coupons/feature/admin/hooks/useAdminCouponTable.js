import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { VisibleToggleHandler } from "@/global/handler/VisibleToggleHandler.js";
import { requestAdminUpdateCouponVisible, requestGetAdminCouponList } from "@/domains/coupons/store/admin/thunks.js";

export const useAdminCouponTable = () => {
  const dispatch = useDispatch();
  const { coupons, loading, error } = useSelector((state) => state.coupon);

  useEffect(() => {
    dispatch(requestGetAdminCouponList());
  }, [dispatch]);

  const changeVisible = VisibleToggleHandler(dispatch, requestAdminUpdateCouponVisible);

  return {
    coupons,
    changeVisible,
    loading,
    error,
  };
};
