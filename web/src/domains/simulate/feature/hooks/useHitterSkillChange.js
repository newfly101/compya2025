import { useEffect, useState } from "react";
import { pickByProbability, PROB_LEGEND } from "@/global/utils/skill/skillProbability.js";
import { pickSkillsByCombo } from "@/global/utils/skill/playerSkillPicker.js";
import { decrypt, encrypt } from "@/global/utils/crypto/storageCrypto.js";
import { useDispatch, useSelector } from "react-redux";
import { requestPlayerSkillSet } from "@/domains/dictionary/store/index.js";

const STORAGE_KEY = "COMPYAFUN-HITTER-SKILL";

/** 구조 검증 (조작 방지) **/
const isValidSkillMap = (data) =>
  typeof data === "object" &&
  data !== null &&
  Object.values(data).every(
    v =>
      Array.isArray(v.skills) &&
      typeof v.count === "number",
  );

export const useHitterSkillChange = () => {
  const [skillStateMap, setSkillStateMap] = useState({});
  const dispatch = useDispatch();
  const { playerSkills } = useSelector((state) => state.dictionary);

  useEffect(() => {
    dispatch(requestPlayerSkillSet("HITTER"));
  }, [dispatch]);

  /** 3레전드 스킬인지 확인하는 코드 **/
  const isTripleLegend = (result) =>
    result.length === 3 &&
    result.every(skill => skill.grade === "LEGEND");

  /** 투수 Map으로 실행해서, 선수 스킬 독립시행 **/
  const rollSkills = (hitter) =>
    pickSkillsByCombo(playerSkills,
      pickByProbability(PROB_LEGEND, {
        hitterId: hitter.id,
      }),
    );

  const rollOnceFor = (hitterName) => {
    if (!hitterName) return;

    const result = rollSkills(hitterName);

    setSkillStateMap(prev => {
      const prevState = prev[hitterName] ?? { skills: [], count: 0 };

      const next = {
        ...prev,
        [hitterName]: {
          skills: result,
          count: prevState.count + 1,
        },
      };

      // 🔐 암호화 저장
      localStorage.setItem(
        STORAGE_KEY,
        encrypt(next)
      );

      return next;
    });
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const decoded = decrypt(saved);

      if (decoded && isValidSkillMap(decoded)) {
        setSkillStateMap(decoded);
      }
      else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);


  return {
    rollOnceFor,
    skillStateMap,
  };
};

export const useHitterSkillInit = ({
                                      cardInfo,
                                      skillStateMap,
                                      rollOnceFor,
                                    }) => {
  useEffect(() => {
    if (!cardInfo || cardInfo.length === 0) return;

    // 이미 localStorage 복구된 경우면 스킵
    if (Object.keys(skillStateMap).length > 0) return;

    // 🔥 최초 1회: 전체 타자에게 roll
    cardInfo.forEach((player) => {
      rollOnceFor(player.identity.name);
    });
  }, [cardInfo, skillStateMap, rollOnceFor]);

};
