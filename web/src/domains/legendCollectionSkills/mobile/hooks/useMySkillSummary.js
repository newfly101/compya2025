import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { requestGetSkillItems } from "@/domains/legendCollectionSkills/store/public/thunks.js";

/** 홈 카드용 — 스킬을 등록한 레전드 수. 로그인했을 때만 요청한다. */
export const useMySkillSummary = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuthentication();
  const { items, loaded, loading, error } = useSelector((state) => state.legendCollectionSkills);

  useEffect(() => {
    if (isAuthenticated && !loaded && !loading && !error) dispatch(requestGetSkillItems());
  }, [dispatch, isAuthenticated, loaded, loading, error]);

  return {
    loaded,
    error: !loaded && !!error,
    registered: items.filter((i) => i.slots).length, // normalize 가 미등록을 slots=null 로 통일한다
  };
};
