import { useAuthentication } from "@/features/authentication/hooks/useAuthentication.js";
import { useSkillItemsQuery } from "@/features/legendCollectionSkills/store/queries.js";

/** 홈 카드용 — 스킬을 등록한 레전드 수. 로그인했을 때만 요청한다. */
export const useMySkillSummary = () => {
  const { isAuthenticated, initialized } = useAuthentication();
  const ready = initialized && isAuthenticated; // 세션 확인 전 발사 방지
  const q = useSkillItemsQuery(ready);

  return {
    loaded: q.isSuccess,
    error: !q.isSuccess && !!q.error,
    registered: (q.data ?? []).filter((i) => i.slots).length, // normalize 가 미등록을 slots=null 로 통일한다
  };
};
