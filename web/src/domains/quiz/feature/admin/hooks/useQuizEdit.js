import { useQuizForm } from "./useQuizForm.js";
import { requestAdminQuizUpdate } from "@/domains/quiz/store/admin/thunks.js";

export const useQuizEdit = ({ quiz, onSuccess }) =>
  useQuizForm({
    initialForm: {
      round: quiz.round,
      title: quiz.title,
      imageUrl: quiz.imageUrl,
      imageType: "URL",
      imagePreview: "",
      imageFile: null,
      visible: quiz.visible,
    },
    submitThunk: requestAdminQuizUpdate,
    onSuccess,
    quizId: quiz.id,
  });
