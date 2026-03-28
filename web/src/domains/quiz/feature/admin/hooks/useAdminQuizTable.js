import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { VisibleToggleHandler } from "@/global/handler/VisibleToggleHandler.js";
import { requestAdminQuizAll, requestAdminQuizUpdateVisible } from "@/domains/quiz/store/admin/thunks.js";

export const useAdminQuizTable = () => {
  const dispatch = useDispatch();
  const { quizAnswers, loading, error } = useSelector((state) => state.quiz);

  useEffect(() => {
    dispatch(requestAdminQuizAll());
  }, [dispatch]);

  const changeVisible = VisibleToggleHandler(dispatch, requestAdminQuizUpdateVisible);

  return { quizAnswers, changeVisible, loading, error };
};
