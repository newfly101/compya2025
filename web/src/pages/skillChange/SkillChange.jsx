import React, { useEffect, useState } from "react";
import { pickSkillsByCombo } from "@/utils/skill/skillPicker.js";
import { pickByProbability, PROB_LEGEND } from "@/utils/skill/skillProbability.js";
import styles from "@/styles/pages/skillCard.module.scss";
import { useNavigate } from "react-router-dom";
import { legendPitcherData } from "@/data/player/legend/legendPitcherData.js";

const SkillChange = () => {
  const navigate = useNavigate();
  const [selectedPitcher, setSelectedPitcher] = useState(null);
  const [skills, setSkills] = useState([]);
  const [skillChangeCount, setSkillChangeCount] = useState(-1);
  const [isInitialRoll, setIsInitialRoll] = useState(true);

  const isTripleLegend = (result) =>
    result.length === 3 &&
    result.every(skill => skill.grade === "LEGEND");

  const rollOnce = () => {
    if (!selectedPitcher) return;

    const combo = pickByProbability(PROB_LEGEND, {
      pitcherId: selectedPitcher.id,
      pitchTypes: selectedPitcher.pitchTypes,
    });

    const result = pickSkillsByCombo(combo);

    // ✅ 최초 자동 실행 + 3LEGEND일 때만 한 번 더
    if (isInitialRoll && isTripleLegend(result)) {
      setIsInitialRoll(false); // 최초 조건 소진
      return rollOnce();
    }

    setIsInitialRoll(false);     // 최초 실행 종료
    setSkillChangeCount(prev => prev + 1);
    setSkills(result);
  };

  useEffect(() => {
    if (!selectedPitcher) return;

    setIsInitialRoll(true); // 🔥 투수 변경 → 최초 상태
    setSkillChangeCount(-1);
    rollOnce();
  }, [selectedPitcher]);

  const handleClick = () => {
    navigate(`/`);
  };


  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.category} onClick={handleClick}>← 메인으로</span>
        <h1 className={styles.title}>🎲 고급 고유능력 변경권 시뮬레이터</h1>

        <div className={styles.meta}>
          <span>2025-12-25</span>
          <span>v0.1.1</span>
        </div>
      </header>

      <section className={styles.pitcherSelectSection}>
        <h2 className={styles.subTitle}>⚾ 투수 선택</h2>

        <div className={styles.pitcherGrid}>
          {legendPitcherData.map((p) => (
            <button
              key={p.id}
              className={`${styles.pitcherButton} ${
                selectedPitcher?.id === p.id ? styles.active : ""
              }`}
              onClick={() => setSelectedPitcher(p)}
            >
              <strong>{p.name}</strong>
              {/*<span className={styles.team}>{p.team}</span>*/}
            </button>
          ))}
        </div>
      </section>

      {selectedPitcher && (
        <section className={styles.cardSection}>
          <div className={styles.skillCard}>

            {/* 이 영역은 absolute라 변경 x */}
            <div className={styles.slotWrap}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`${styles.slot} ${
                    skills[i] ? styles[skills[i].grade.toLowerCase()] : ""
                  }`}
                >
                  {skills[i] && <strong>{skills[i].name} {skills[i].upgrade}</strong>}
                </div>
              ))}

            </div>
          </div>
          {/*<button className={styles.itemButton} onClick={rollOnce}>*/}
          {/*  <div className={styles.textBox}>*/}
          {/*    <span className={styles.title}>고급 고유능력 변경권</span>*/}
          {/*    <span className={styles.count}>{skillChangeCount}</span>*/}
          {/*  </div>*/}
          {/*</button>*/}

          <button
            className={styles.itemButton}
            onClick={rollOnce}
            disabled={!selectedPitcher}
          >
            <div className={styles.textBox}>
              <span className={styles.title}>고급 고유능력 변경권</span>
              <span className={styles.count}>{skillChangeCount}</span>
            </div>
          </button>
        </section>
      )}

      <div className={styles.skillCard2}>
        {/* 팀명 */}
        <div className={styles.teamName}>정민태</div>

        {/* 기본 정보 */}
        <div className={styles.metaBlock}>
          <div className={styles.metaGrid}> 소속팀 <strong>현대 유니콘스</strong></div>
          <div className={styles.metaGrid}> 포지션 <strong>SP</strong></div>
          <div className={styles.metaGrid}>등번호 <strong>등번호 20번</strong></div>
          <div className={styles.metaGrid}>생년월일 <strong>1970년 3월 1일</strong></div>
          <div className={styles.metaGrid}>투타 <strong>우투/우타</strong></div>
        </div>

        {/* 상단 정보 그리드 존 */}
        <div className={styles.infoGrid}>

          {/* 기록 */}
          <div className={styles.statBlock}>
            <div className={styles.statHeader}>
              <span>시즌</span> <span>경기수</span> <span>방어율</span> <span>승</span> <span>패</span>
              <span>세이브</span><span>삼진</span>
            </div>
            <div className={styles.statValue}>
              <span>15</span><span>290</span><span>3.48</span>
              <span>124</span><span>96</span><span>3</span><span>1278</span>
            </div>
          </div>

          {/* 능력치 */}
          <div className={styles.attrBlock}>
            <div className={styles.attrHeader}>
              <span>제구</span><span>구위</span><span>체력</span><span>직구</span><span>변화</span>
            </div>
            <div className={styles.attrValue}>
              <span>92</span><span>89</span><span>89</span><span>95</span><span>89</span>
            </div>
          </div>

          {/* 특성 */}
          <div className={styles.cardInfo}>
            고유능력 <span>강화 횟수  0/7</span>
          </div>

        </div>

        {/* 슬롯 */}
        <div className={styles.slotWrap}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`${styles.slot} ${
                skills[i] ? styles[skills[i].grade.toLowerCase()] : ""
              }`}
            >
              {skills[i] && <strong>{skills[i].name} {skills[i].upgrade}</strong>}
            </div>
          ))}

        </div>

        {/* 특성 */}
        <div className={styles.traits}>
          <div className={styles.option}>
            <span className={styles.option1}>특이폼</span>
            <span className={styles.option2}>페이스</span>
          </div>
          <span>LEGEND</span>
        </div>
      </div>


    </main>
  )
    ;
};

export default SkillChange;
