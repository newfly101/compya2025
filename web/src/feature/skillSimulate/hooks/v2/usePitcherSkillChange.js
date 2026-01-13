import { useEffect, useState } from "react";
import { pickByProbability, PROB_LEGEND } from "@/utils/skill/skillProbability.js";
import { pickSkillsByCombo } from "@/utils/skill/pitcherSkillPicker.js";
import { legendPitcherData } from "@/data/player/legend/legendPitcherData.js";
import { decrypt, encrypt } from "@/utils/crypto/storageCrypto.js";

const STORAGE_KEY = "COMPYAFUN-PITCHER-SKILL";

/** 구조 검증 (조작 방지) **/
const isValidSkillMap = (data) =>
  typeof data === "object" &&
  data !== null &&
  Object.values(data).every(
    v =>
      Array.isArray(v.skills) &&
      typeof v.count === "number",
  );

export const usePitcherSkillChange = () => {
  const [skillStateMap, setSkillStateMap] = useState({});

  /** 3레전드 스킬인지 확인하는 코드 **/
  const isTripleLegend = (result) =>
    result.length === 3 &&
    result.every(skill => skill.grade === "LEGEND");

  /** 투수 Map으로 실행해서, 선수 스킬 독립시행 **/
  const rollSkills = (pitcher) =>
    pickSkillsByCombo(
      pickByProbability(PROB_LEGEND, {
        pitcherId: pitcher.id,
        pitchTypes: pitcher.pitchTypes,
      }),
    );

  const rollOnceFor = (pitcher) => {
    if (!pitcher) return;

    const result = rollSkills(pitcher);

    setSkillStateMap(prev => {
      const key = pitcher.name;
      const prevState = prev[key] ?? { skills: [], count: 0 };

      const next = {
        ...prev,
        [key]: {
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
        return;
      }

      // ❌ 복호화 실패 or 구조 이상
      localStorage.removeItem(STORAGE_KEY);
    }

    const initialMap = {};

    legendPitcherData.forEach(pitcher => {
      let result = rollSkills(pitcher);

      if (isTripleLegend(result)) {
        result = rollSkills(pitcher);
      }

      initialMap[pitcher.name] = {
        skills: result,
        count: 0,
      };
    });

    setSkillStateMap(initialMap);
    localStorage.setItem(
      STORAGE_KEY,
      encrypt(initialMap)
    );
  }, []);


  return {
    rollOnceFor,
    skillStateMap,
  };
};
