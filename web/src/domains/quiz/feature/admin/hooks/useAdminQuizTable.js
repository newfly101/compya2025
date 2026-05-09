import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { requestAdminQuizAll } from "@/domains/quiz/store/admin/thunks.js";

export const useAdminQuizTable = () => {
  const dispatch = useDispatch();
  const { quizAnswers, loading, error } = useSelector((state) => state.quiz);

  useEffect(() => {
    dispatch(requestAdminQuizAll());
  }, [dispatch]);

  return { quizAnswers, loading, error };
};
