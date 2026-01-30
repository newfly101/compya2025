import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { requestGetCouponList, requestUpdateCouponVisible } from "@/domains/coupons/store/index.js";

export const useCouponListAdmin = () => {
  const dispatch = useDispatch();
  const { coupons, loading, error } = useSelector((state) => state.coupon);
  const nowDate = new Date();

  useEffect(() => {
    dispatch(requestGetCouponList());
  }, [dispatch]);

  const handleVisibleChange = (id) => (nextVisible) => {
    dispatch(
      requestUpdateCouponVisible({
        id,
        visible: nextVisible,
      })
    );
  };

  return {
    coupons,
    nowDate,
    handleVisibleChange,
    loading,
    error,
  };
};
