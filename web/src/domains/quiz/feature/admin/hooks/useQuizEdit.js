import { useQuizForm } from "./useQuizForm.js";
import { requestAdminQuizUpdate } from "@/domains/quiz/store/admin/thunks.js";

export const useQuizEdit = ({ quiz, onSuccess }) =>
  useQuizForm({
    initialForm: {
      round: quiz.round,
      imageUrl: quiz.imageUrl,
      imageType: "URL",
      imagePreview: "",
      imageFile: null,
    },
    submitThunk: requestAdminQuizUpdate,
    onSuccess,
    quizId: quiz.id,
  });
