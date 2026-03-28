import { useQuizForm } from "./useQuizForm.js";
import { requestAdminQuizCreate } from "@/domains/quiz/store/admin/thunks.js";

export const useQuizCreate = ({ onSuccess }) =>
  useQuizForm({
    initialForm: {
      round: "",
      title: "",
      imageUrl: "",
      imageType: "FILE",
      imagePreview: "",
      imageFile: null,
      visible: true,
    },
    submitThunk: requestAdminQuizCreate,
    onSuccess,
  });
