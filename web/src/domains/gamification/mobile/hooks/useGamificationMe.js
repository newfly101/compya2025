import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestGetMyGamification } from "@/domains/gamification/store/public/thunks.js";

// 내 등급·포인트·칭호. 마운트할 때마다 새로 읽고, 응답 오기 전엔 이전 값을 그대로 보여준다.
export function useGamificationMe() {
  const dispatch = useDispatch();
  const { me, loading, error } = useSelector((s) => s.gamification);

  useEffect(() => {
    dispatch(requestGetMyGamification());
  }, [dispatch]);

  return { me, loading, error, reload: () => dispatch(requestGetMyGamification()) };
}
