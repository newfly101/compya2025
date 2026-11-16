import { useAuthentication } from "@/features/authentication/hooks/useAuthentication.js";
import { useMyGamificationQuery } from "@/features/gamification/store/queries.js";

// 내 등급·포인트·칭호. 마운트할 때마다 새로 읽고, 응답 오기 전엔 이전 값을 그대로 보여준다.
export function useGamificationMe() {
  const { isAuthenticated, initialized } = useAuthentication();
  const ready = initialized && isAuthenticated; // 세션 확인 전 발사 방지
  const q = useMyGamificationQuery(ready);
  return { me: q.data ?? null, loading: q.isFetching, error: q.error?.message ?? null, reload: q.refetch };
}
