import { useEffect, useState } from "react";
import { pickByProbability, PROB_LEGEND } from "@/global/utils/skill/skillProbability.js";
import { pickSkillsByCombo } from "@/global/utils/skill/playerSkillPicker.js";
import { decrypt, encrypt } from "@/global/utils/crypto/storageCrypto.js";
import { useDispatch, useSelector } from "react-redux";
import { requestPlayerSkillSet } from "@/domains/dictionary/store/index.js";

const STORAGE_KEY = "COMPYAFUN-PITCHER-SKILL-V2";

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
  const dispatch = useDispatch();
  const { playerSkills } = useSelector((state) => state.dictionary);

  useEffect(() => {
    dispatch(requestPlayerSkillSet("PITCHER"));
  }, [dispatch]);

  /** 3레전드 스킬인지 확인하는 코드 **/
  const isTripleLegend = (result) =>
    result.length === 3 &&
    result.every(skill => skill.grade === "LEGEND");

  /** 투수 Map으로 실행해서, 선수 스킬 독립시행 **/
  const rollSkills = (pitcherName) =>
    pickSkillsByCombo(playerSkills,
      pickByProbability(PROB_LEGEND, {
        pitcherId: pitcherName,
        // pitchTypes: pitcher.pitchTypes,
      }),
    );

  const rollOnceFor = (pitcherName) => {
    if (!pitcherName) return;

    const result = rollSkills(pitcherName);

    setSkillStateMap(prev => {
      const prevState = prev[pitcherName] ?? { skills: [], count: 0 };

      const next = {
        ...prev,
        [pitcherName]: {
          skills: result,
          count: prevState.count + 1,
        },
      };

      // 🔐 암호화 저장
      localStorage.setItem(
        STORAGE_KEY,
        encrypt(next),
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
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);


  return {
    rollOnceFor,
    skillStateMap,
  };
};

export const usePitcherSkillInit = ({
                                      cardInfo,
                                      skillStateMap,
                                      rollOnceFor,
                                    }) => {
  useEffect(() => {
    if (!cardInfo || cardInfo.length === 0) return;

    // 이미 localStorage 복구된 경우면 스킵
    if (Object.keys(skillStateMap).length > 0) return;

    // 🔥 최초 1회: 전체 투수에게 roll
    cardInfo.forEach((player) => {
      rollOnceFor(player.identity.name);
    });
  }, [cardInfo, skillStateMap, rollOnceFor]);

};
