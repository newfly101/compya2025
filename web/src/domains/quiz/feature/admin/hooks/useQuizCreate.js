import { useQuizForm } from "./useQuizForm.js";
import { requestAdminQuizCreate } from "@/domains/quiz/store/admin/thunks.js";

export const useQuizCreate = ({ onSuccess, initialRound = "" }) =>
  useQuizForm({
    initialForm: {
      round: initialRound,
      imageUrl: "",
      imageType: "FILE",
      imagePreview: "",
      imageFile: null,
    },
    submitThunk: requestAdminQuizCreate,
    onSuccess,
  });
