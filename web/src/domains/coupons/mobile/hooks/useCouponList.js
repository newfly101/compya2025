import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { requestGetUserCouponList } from "@/domains/coupons/store/public/thunks.js";
import { formatNow } from "@/global/utils/datetime/dateUtils.js";

export const useCouponList = () => {
  const dispatch = useDispatch();
  // 공개 목록 전용 칸 — 관리자 목록(state.coupon.coupons)에는 숨김 쿠폰이 들어 있다.
  const couponList = useSelector(state => state.coupon.publicCoupons) ?? [];
  // 공개 조회 전용 칸 — loading/error 는 관리자 목록 조회 칸이고 mutateLoading/mutateError 는
  // 관리자 쓰기 칸이다. 그걸 읽으면 관리자 화면에서 난 저장 실패가 공개 화면 오류로 뜬다.
  const loading = useSelector(state => state.coupon.publicLoading);
  const error = useSelector(state => state.coupon.publicError);

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
