import { useSelector } from "react-redux";
import QuizModal from "./QuizModal.jsx";
import { useQuizCreate } from "@/domains/quiz/feature/admin/hooks/useQuizCreate.js";

const QuizCreateModal = ({ onClose }) => {
  const quizAnswers = useSelector((state) => state.quiz?.quizAnswers) ?? [];
  const latestRound = quizAnswers.reduce(
    (max, q) => (Number(q.round) > max ? Number(q.round) : max),
    0
  );
  const initialRound = latestRound > 0 ? latestRound + 1 : "";

  const hook = useQuizCreate({ onSuccess: onClose, initialRound });

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
