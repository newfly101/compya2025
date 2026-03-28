import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestSkillScoreConfig } from "@/domains/simulate/store/index.js";

/**
 * 스킬 점수 설정 데이터를 Redux에서 조회하고 없으면 fetch하는 훅
 * - 서버 캐싱 + sessionStorage 이중 캐싱
 */
export const useSkillScoreConfig = () => {
  const dispatch = useDispatch();
  const { scoreConfig } = useSelector((state) => state.simulate);

  useEffect(() => {
    if (!scoreConfig) {
      dispatch(requestSkillScoreConfig());
    }
    console.log(scoreConfig);
  }, [dispatch, scoreConfig]);

  return {
    scoreConfig,
    isLoading: !scoreConfig,
  };
};
