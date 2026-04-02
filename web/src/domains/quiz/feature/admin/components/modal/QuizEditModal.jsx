import QuizModal from "./QuizModal.jsx";
import { useQuizEdit } from "@/domains/quiz/feature/admin/hooks/useQuizEdit.js";

const QuizEditModal = ({ quiz, onClose }) => {
  const hook = useQuizEdit({ quiz, onSuccess: onClose });

  return (
    <QuizModal
      title="퀴즈 정답 수정"
      submitLabel="수정"
      form={hook.form}
      onChange={hook.handleChange}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
      onImageTypeChange={hook.handleImageTypeChange}
      onFileChange={hook.handleFileChange}
    />
  );
};

export default QuizEditModal;
