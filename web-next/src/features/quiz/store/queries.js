import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminQuizAll, fetchAdminQuizCreate, fetchAdminQuizUpdate, fetchAdminQuizBulkDelete } from "@/features/quiz/store/api.js";
import { invalidatePublic } from "@/features/admin/config/adminQueryKeys.js";

export const adminQuizKeys = { list: ["admin", "quiz", "list"] };

const toBody = (state) => ({ round: Number(state.round), imageUrl: state.imageUrl });

export const useAdminQuizList = () => useQuery({ queryKey: adminQuizKeys.list, queryFn: fetchAdminQuizAll, staleTime: 0 });

const useQuizMutation = (mutationFn, notify) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    meta: notify ? { notify: { success: notify } } : undefined,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminQuizKeys.list });
      invalidatePublic(qc, "quiz");
    },
  });
};

export const useAdminQuizCreate = () => useQuizMutation((quiz) => fetchAdminQuizCreate(toBody(quiz)), "퀴즈를 등록했습니다.");
export const useAdminQuizUpdate = () => useQuizMutation(({ id, ...quiz }) => fetchAdminQuizUpdate(id, toBody(quiz)), "퀴즈를 수정했습니다.");
// 응답 { successIds, failedIds } — 200 이어도 일부만 지워졌을 수 있다. 목록은 다시 읽어 실제 상태를 반영한다.
export const useAdminQuizBulkDelete = () => useQuizMutation(fetchAdminQuizBulkDelete);
