import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminUserList, fetchAdminPatchRole, fetchAdminPatchStatus } from "@/domains/users/store/admin/api.js";
import { usersKeys } from "@/domains/users/store/public/queries.js";

export const adminUserKeys = { list: ["admin", "users", "list"] };

// 검색·필터·페이지 이동을 전부 화면에서 하고 상단 배지도 받은 개수를 센다 — 서버 기본 페이지(20)로 받으면 잘린다. 전량 요청.
// 셸 탭 배지와 같은 키라 요청은 1번. ponytail: 상한 1000. 넘으면 총건수를 주는 API 가 필요하다.
export const USERS_FETCH_ALL_SIZE = 1000;

export const useAdminUserList = () =>
  useQuery({
    queryKey: adminUserKeys.list,
    queryFn: async () => (await fetchAdminUserList({ page: 0, size: USERS_FETCH_ALL_SIZE })) ?? [],
    staleTime: 0,
  });

// 역할·상태 변경 뒤 목록을 다시 읽고, 내 정보(users/me) 캐시도 무효화한다(본인 계정 변경 대비).
const useUserPatch = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    // 목록 재조회가 끝난 뒤 resolve — 열려 있는 모달이 갱신된 값을 바로 본다
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: usersKeys.me });
      await qc.invalidateQueries({ queryKey: adminUserKeys.list });
    },
  });
};

export const useAdminPatchUserRole = () => useUserPatch(({ publicId, userRole }) => fetchAdminPatchRole(publicId, userRole));
export const useAdminPatchUserStatus = () => useUserPatch(({ publicId, userStatus }) => fetchAdminPatchStatus(publicId, userStatus));
