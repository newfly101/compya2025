import QuizModal from "./QuizModal.jsx";
import { useQuizCreate } from "@/domains/quiz/feature/admin/hooks/useQuizCreate.js";

const QuizCreateModal = ({ onClose }) => {
  const hook = useQuizCreate({ onSuccess: onClose });

  return (
    <QuizModal
      title="퀴즈 정답 등록"
      submitLabel="등록"
      form={hook.form}
      onChange={hook.handleChange}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
      onImageTypeChange={hook.handleImageTypeChange}
      onFileChange={hook.handleFileChange}
    />
  );
};

export default QuizCreateModal;
