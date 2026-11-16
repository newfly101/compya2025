import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteMyAccount,
  fetchMyInfo,
  fetchNicknameAvailable,
  patchMyNickname,
  patchMyProfileImage,
} from "@/features/users/store/api.js";

export const usersKeys = { me: ["users", "me"] };

// 내 정보 — 마운트할 때마다 새로 읽는다(staleTime 0). 같은 키라 동시 요청은 1번만 나간다.
export const useMyInfoQuery = (enabled = true) =>
  useQuery({ queryKey: usersKeys.me, queryFn: fetchMyInfo, enabled, staleTime: 0 });

// 성공 응답(변경된 프로필 전체)이 곧 새 내 정보다 — 캐시를 그대로 교체한다
const useProfileMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({ mutationFn, onSuccess: (profile) => qc.setQueryData(usersKeys.me, profile) });
};

export const useUpdateNicknameMutation = () => useProfileMutation(patchMyNickname);

// profileImage: 업로드된 이미지 주소. 빈 문자열이면 기본 이미지로 되돌린다.
export const useUpdateProfileImageMutation = () => useProfileMutation(patchMyProfileImage);

// 사용 가능하면 true. 형식 오류(400)는 Error("FORMAT") 로 reject — 화면이 구분한다.
export const useCheckNicknameMutation = () =>
  useMutation({
    mutationFn: async (nickname) => {
      try {
        return await fetchNicknameAvailable(nickname);
      } catch (error) {
        throw new Error(error.response?.status === 400 ? "FORMAT" : error.message);
      }
    },
  });

export const useDeleteAccountMutation = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: deleteMyAccount, onSuccess: () => qc.setQueryData(usersKeys.me, null) });
};
