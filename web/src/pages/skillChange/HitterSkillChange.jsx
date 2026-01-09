import React, { useEffect, useRef, useState } from "react";
import { pickSkillsByCombo } from "@/utils/skill/hitterSkillPicker.js";
import { pickByProbability, PROB_LEGEND } from "@/utils/skill/skillProbability.js";
import styles from "@/styles/pages/skillCard.module.scss";
import { useNavigate } from "react-router-dom";
import { legendBatterData } from "@/data/player/legend/legendBatterData.js";
import BatterSkillCard from "@/pages/skillChange/HitterSkillCard.jsx";

const HitterSkillChange = () => {
  const navigate = useNavigate();
  const [selectedBatter, setSelectedBatter] = useState(null);
  const [skills, setSkills] = useState([]);
  const [skillChangeCount, setSkillChangeCount] = useState(-1);
  const [isInitialRoll, setIsInitialRoll] = useState(true);

  // 자동 3보라 옵션 뽑기
  const [isRolling, setIsRolling] = useState(false);
  const intervalRef = useRef(null);

  const isTripleLegend = (result) =>
    result.length === 3 &&
    result.every(skill => skill.grade === "LEGEND");

  const rollOnce = () => {
    if (!selectedBatter) return;

    const combo = pickByProbability(PROB_LEGEND, {
      pitcherId: selectedBatter.id,
      pitchTypes: selectedBatter.pitchTypes,
    });

    const result = pickSkillsByCombo(combo);
    // console.log(result.filter(skill => skill.grade === "LEGEND").length);

    setIsInitialRoll(false);     // 최초 실행 종료
    setSkillChangeCount(prev => prev + 1);
    setSkills(result);

    return result;
  };

  const startRollingUntil3Legend = () => {
    if (intervalRef.current || !selectedBatter) return;

    setIsRolling(true);

    intervalRef.current = setInterval(() => {
      const result = rollOnce();
      if (!result) return;

      if (result.filter(skill => skill.grade === "LEGEND").length === 3) {
        stopRolling();
      }
    }, 100);
  };

  useEffect(() => {
    if (!selectedBatter) return;

    setIsInitialRoll(true); // 🔥 투수 변경 → 최초 상태
    setSkillChangeCount(-1);
    rollOnce();
  }, [selectedBatter]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const stopRolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRolling(false);
  };

  const handleClick = () => {
    navigate(`/simulate`);
  };


  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.category} onClick={handleClick}>← 스킬 시뮬레이터로</span>
        <h1 className={styles.title}>🎲 타자 고스변 시뮬레이터</h1>

        <div className={styles.meta}>
          <span>2026-01-09</span>
          <span>v0.1.7</span>
        </div>
      </header>

      <h6>선수 이미지는 저작권 문제로 인해 변경하였습니다.</h6>

      <section className={styles.pitcherSelectSection}>
        <h2 className={styles.subTitle}>⚾ 투수 선택</h2>

        <div className={styles.pitcherGrid}>
          {legendBatterData.map((p) => (
            <button
              key={p.id}
              className={`${styles.pitcherButton} ${
                selectedBatter?.id === p.id ? styles.active : ""
              }`}
              onClick={() => setSelectedBatter(p)}
            >
              <strong>{p.name}</strong>
            </button>
          ))}
        </div>
      </section>

      {selectedBatter && (
        <section className={styles.cardSection}>
          <BatterSkillCard
            hitter={selectedBatter}
            skills={skills}
          />

          <button
            className={styles.itemButton}
            onClick={rollOnce}
            disabled={!selectedBatter}
          >
            <div className={styles.textBox}>
              <span className={styles.title}>고급 고유능력 변경권</span>
              <span className={styles.count}>{skillChangeCount}</span>
            </div>
          </button>

          {/*<button*/}
          {/*  className={styles.itemButton}*/}
          {/*  onClick={() => {*/}
          {/*    if (isRolling) {*/}
          {/*      stopRolling(); */}
          {/*    } else {*/}
          {/*      startRollingUntil3Legend(); */}
          {/*    }*/}
          {/*  }}*/}
          {/*  disabled={!selectedBatter}*/}
          {/*>*/}
          {/*  {isRolling ? "연속 변경 중지" : "3 LEGEND 나올 때까지 변경"}*/}
          {/*</button>*/}
        </section>
      )}
    </main>
  );
};

export default HitterSkillChange;
