import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestPlayerCardInfo } from "@/domains/simulate/store/index.js";

/**
 * 타자/투수 카드 데이터를 Redux에서 조회하고 없으면 fetch하는 훅
 * @param {"HITTER" | "PITCHER"} role
 */
export const usePlayerCardData = (role) => {
  const dispatch = useDispatch();
  const { cardInfo } = useSelector((state) => state.simulate);

  useEffect(() => {
    dispatch(requestPlayerCardInfo(role));
  }, [dispatch, role]);

  return {
    cardInfo,
    isLoading: !cardInfo || cardInfo.length === 0,
  };
};
