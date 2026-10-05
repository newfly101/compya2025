import styles from "./SkillCard.module.scss";

const GRADE_KEY = { 레전드: "legend", 플래티넘: "platinum", 히어로: "hero", 노말: "normal" };

/**
 * 스킬 카드 — 데이터를 받아 그리기만 한다 (저장·로그인·요청 지식 없음. 덱 이미지 저장에서도 재사용).
 * kind: "hitter" | "pitcher" · team/name: "롯데 전준호B" · position: "CF"
 * slots: [{ name, grade(현재 등급), skillGrade(레전드|플래티넘|히어로|노말) }] 3개, 없으면 null(빈 상태)
 * enhanceCount: 총 강화 횟수, null 이면 "—" (일괄 적용으로 알 수 없음)
 */
const SkillCard = ({ kind, team, name, position, enhanceCount, slots }) => (
  <div className={styles.card} style={{ backgroundImage: `url(/cards/${kind}_legend.webp)` }}>
    <p className={styles.title}>{`${team} ${name}`}</p>
    <div className={styles.bottom}>
      {slots ? (
        <>
          <span className={styles.count}>{`강화 횟수 ${enhanceCount ?? "—"}/7`}</span>
          <ul className={styles.skills}>
            {slots.map((s, i) => (
              <li key={i} className={styles.skill} data-grade={GRADE_KEY[s.skillGrade]}>
                {`${s.name} ${s.grade}`}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className={styles.empty}>스킬을 등록해 보세요</p>
      )}
      <span className={styles.pos}>{position}</span>
    </div>
  </div>
);

export default SkillCard;
