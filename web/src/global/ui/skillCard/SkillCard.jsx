import styles from "./SkillCard.module.scss";

const GRADE_KEY = { 레전드: "legend", 플래티넘: "platinum", 히어로: "hero", 노말: "normal" };

/**
 * 스킬 카드 — 데이터를 받아 그리기만 한다 (저장·로그인·요청 지식 없음. 덱 이미지 저장에서도 재사용).
 * 색 토큰 --color-lcsk-grade-* 는 쓰는 화면이 legendCollectionSkills.tokens.scss 를 한 번 불러와야 한다.
 * kind: "hitter" | "pitcher" · team/name: "롯데 전준호B" · position: "CF"
 * slots: [{ name, grade(현재 등급), skillGrade(레전드|플래티넘|히어로|노말) }] 3개, 없으면 null(빈 상태)
 * enhanceCount: 총 강화 횟수, null 이면 "—" (일괄 적용으로 알 수 없음)
 * 선택 옵션(모두 생략 가능): hideEnhance 강화 횟수 줄 숨김 · counts {gsb, sel} 우측 상단 누적 박스(강화 줄 대신)
 *   · nickname 하단 닉네임 · emptyText 빈 상태 문구 · onSelectSlot(index) 를 주면 칸이 버튼이 되고 selectedSlot 칸에 테두리만 더한다(칸 색 유지)
 */
const SkillCard = ({ kind, team, name, position, enhanceCount, slots, hideEnhance, counts, nickname, emptyText, selectedSlot, onSelectSlot }) => (
  <div className={styles.card} style={{ backgroundImage: `url(/cards/${kind}_legend.webp)` }}>
    <p className={styles.title}>{`${team} ${name}`}</p>
    <div className={styles.bottom}>
      {slots ? (
        <>
          {counts ? (
            <span className={styles.counts}>
              <span>{`고스변 ${counts.gsb}`}</span>
              <span>{`선변 ${counts.sel}`}</span>
            </span>
          ) : (
            !hideEnhance && <span className={styles.count}>{`강화 횟수 ${enhanceCount ?? "—"}/7`}</span>
          )}
          <ul className={styles.skills}>
            {slots.map((s, i) => {
              const text = s.grade ? `${s.name} ${s.grade}` : s.name; // grade(강화 등급 글자)가 없으면 이름만
              return (
                <li key={i} className={styles.skill} data-grade={GRADE_KEY[s.skillGrade]} data-selected={selectedSlot === i || undefined}>
                  {onSelectSlot ? (
                    <button type="button" className={styles.pick} aria-pressed={selectedSlot === i} onClick={() => onSelectSlot(i)}>
                      {text}
                    </button>
                  ) : (
                    text
                  )}
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className={styles.empty}>{emptyText ?? "스킬을 등록해 보세요"}</p>
      )}
      <span className={styles.foot}>
        {nickname && <span className={styles.nick}>{nickname}</span>}
        <span className={styles.pos}>{position}</span>
      </span>
    </div>
  </div>
);

export default SkillCard;
