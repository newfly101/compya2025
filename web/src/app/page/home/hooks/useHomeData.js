import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { requestLatestQuizAnswer } from "@/domains/quiz/store/public/thunks.js";

export const useHomeData = () => {
  const dispatch = useDispatch();
  const latest = useSelector((state) => state.quiz.latest);

  useEffect(() => {
    dispatch(requestLatestQuizAnswer());
  }, [dispatch]);

  return {
    quizTitle: latest?.title ?? null,
    quizImg: latest?.imageUrl ?? null,
  };
};
