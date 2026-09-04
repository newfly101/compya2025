// domains/mileage/mobile/MileageScreen.jsx
// 마일리지 저격 경로 — 핸드오프 mileage-sniper.html 이식 (design_handoff_mileage/README.md 참조).
// beta: UI 까지만. 서버 API·DB 연결은 다음 라운드.
//
// 상태(로딩/에러/빈/정상) 분기가 아니라 "메인/표" 두 화면 분기형 단일 페이지라
// 컨벤션 §3 원칙대로 하위 부품으로 쪼개지 않는다.

import { useRef } from "react";
import { T, TEAMS, Y, YEARS, teamName, yearName } from "@/domains/mileage/config/mileage.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useMileage } from "./hooks/useMileage";
import { useMileageRowHeight } from "./hooks/useMileageRowHeight";
import "./mileage.tokens.scss";
import styles from "./MileageScreen.module.scss";

const pickClass = (o, styleSet) => {
  if (o.goal) return `${styleSet.pk} ${styleSet.win}`;
  if (o.best) return `${styleSet.pk} ${styleSet.best}`;
  return styleSet.pk;
};

const cellClass = (cell, styleSet) => {
  const cls = [styleSet.td];
  if (cell.kind === "void") cls.push(styleSet.void);
  else cls.push(styleSet.tappable);
  if (cell.kind === "goal") cls.push(styleSet.goal);
  if (cell.kind === "team") cls.push(styleSet.team);
  if (cell.kind === "year") cls.push(styleSet.year);
  if (cell.here) cls.push(styleSet.here);
  return cls.join(" ");
};

const MileageScreen = () => {
  useDomainTopBar("마일리지 저격 경로");

  const m = useMileage();
  const { view, hero, grid, examples, heatmap } = m;

  const theadRef = useRef(null);
  const rowH = useMileageRowHeight(view === "table", theadRef);

  if (view === "table") {
    return (
      <div className={styles.screen}>
        <section className={styles.board}>
          <div className={styles.boardTop}>
            <b>구단 × 연도</b>
            <i className={styles.boardSub}>{`${TEAMS[m.goalT].n} ${YEARS[m.goalY]} 로 가는 길`}</i>
            <button
              type="button"
              className={styles.chipClose}
              aria-label="돌아가기"
              onClick={m.closeTable}
            >
              ✕
            </button>
          </div>

          <div className={styles.tableControls}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${heatmap ? styles.toggleOn : ""}`}
              aria-pressed={heatmap}
              onClick={m.toggleHeatmap}
            >
              히트맵 {heatmap ? "켬" : "끔"}
            </button>
            <button
              type="button"
              className={styles.toggleBtn}
              aria-pressed={m.arrowStyle === "화살표"}
              onClick={m.toggleArrowStyle}
            >
              표시 {m.arrowStyle}
            </button>
          </div>

          <div className={styles.gridScroll} style={{ "--rh": `${rowH}px` }}>
            <table className={styles.table}>
              <colgroup>
                <col className={styles.ycol} />
                <col span={T} />
              </colgroup>
              <thead ref={theadRef}>
                <tr>
                  <th />
                  {TEAMS.map((t) => (
                    <th key={t.c}>{t.n}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid?.rows.map((row) => (
                  <tr key={row.year}>
                    <th className={styles.yearHead}>{row.year}</th>
                    {row.cells.map((cell) => (
                      <td
                        key={cell.t}
                        className={cellClass(cell, styles)}
                        style={
                          cell.heatAlpha != null
                            ? { background: `rgba(var(--color-mileage-heat-rgb), ${cell.heatAlpha.toFixed(3)})` }
                            : undefined
                        }
                        title={cell.title}
                        onClick={cell.kind !== "void" ? () => m.selectCell(cell.t, row.y) : undefined}
                      >
                        {cell.glyph}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.legend}>
            <span>
              <i>{m.arrowGlyphs.team}</i>구단 돌리기
            </span>
            <span>
              <i>{m.arrowGlyphs.year}</i>연도 돌리기
            </span>
            <span>
              <i className={styles.legendGoal}>●</i>목표
            </span>
            <span>
              <i className={styles.legendHere}>▢</i>지금 위치
            </span>
          </div>
        </section>
        <p className={styles.caption}>
          칸을 누르면 그 자리를 지금 위치로 놓고 다음 한 수를 다시 계산합니다.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <p className={styles.lead}>
        저격할 재료의 구단 × 연도를 입력하면, 어떤 걸 먼저 작업해야 할지 알려드립니다.
      </p>

      <details className={styles.note}>
        <summary>처음이신가요? 읽어보세요</summary>
        <div className={styles.noteBody}>
          <p>
            <b>왜 포지션부터 뽑나요</b>
            <br />
            레전드 재료를 저격할 때는, 그 구단·연도에 해당 포지션 선수가 딱 한 명뿐인 칸을
            노립니다. 포지션을 먼저 정해두면 구단과 연도가 맞는 순간 원하는 선수가 그대로
            확정됩니다. 그래서 순서가 <b>포지션 → 구단·연도</b>입니다.
          </p>
          <p>
            <b>DH·CP는 쓰지 마세요</b>
            <br />
            연도덱에 따라 아직 들어가지 않은 포지션이 있습니다. DH나 CP처럼 비어 있는 포지션을
            먼저 골라두면 결과가 어긋나니, 이 경우에는 이 도구를 쓰지 않는 편이 낫습니다.
          </p>
          <p>
            <b>화살표가 무슨 뜻인가요</b>
            <br />↔ 는 구단을 돌리라는 뜻, ↕ 는 연도를 돌리라는 뜻입니다. 지금 위치에서 목표
            카드까지 더 빨리 갈 수 있는 쪽을 알아서 골라줍니다.
          </p>
          <p>
            <b>왜 그쪽이 더 나은가요</b>
            <br />
            구단 뽑기는 200, 연도 뽑기는 400입니다. 둘 다 후보 {examples.shown}개가 뜨고 그중
            하나를 고르는 방식이라, 후보가 적을수록 원하는 게 낄 확률이 높습니다. {examples.ex1}
          </p>
          <p>
            <b>구단을 바꿨더니 연도가 사라져요</b>
            <br />
            둘은 서로 묶여 있습니다. {examples.ex2} 게임에 없는 조합이라 아예 목록에서 뺐습니다.
          </p>
          <p>
            <b>초기화는 왜 추천에 없나요</b>
            <br />
            초기화하려면 선수를 먼저 뽑아야 하고 거기에 1,600이 듭니다. 모든 목표를 하나씩 다
            확인해봤는데, 처음부터 다시 하는 쪽이 이득인 경우가 한 번도 없었습니다.
          </p>
          <p>
            <b>예전 저격표와 다른데요</b>
            <br />
            2021년에 나온 표는 후보를 고르지 못하고 하나가 그냥 정해지던 시절 기준입니다. 지금은
            7개 중 고를 수 있어서 훨씬 수월해졌고, 그래서 화살표 방향도 곳곳이 다릅니다. 구단별
            연도는 {examples.span}까지 반영했습니다.
          </p>
          <p>
            <b>앞으로 추가할 것</b>
            <br />
            이번 beta는 <b>구단 × 연도 표</b>를 보는 것까지입니다. 목표로 삼을 레전드 재료는 아직
            직접 골라야 합니다. 어떤 재료를 저격할 수 있는지 한눈에 보려면 선수 백과사전이 먼저
            나와야 해서, 그다음 단계로 마일리지 저격과 레전드 재료를 연결할 계획입니다.
          </p>
        </div>
      </details>

      <div className={styles.setup}>
        <div className={styles.setupRow}>
          <label className={styles.fld}>
            <span>목표 구단</span>
            <select
              value={m.goalT}
              onChange={(e) => m.changeGoalTeam(Number(e.target.value))}
            >
              {TEAMS.map((t, i) => (
                <option key={t.c} value={i}>
                  {t.n}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.fld}>
            <span>목표 연도</span>
            <select value={m.goalY} onChange={(e) => m.changeGoalYear(Number(e.target.value))}>
              {m.goalYearOptions.map((yi) => (
                <option key={yi} value={yi}>
                  {YEARS[yi]}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.fld}>
            <span>
              포지션<em className={styles.tag}>데이터 연결 전</em>
            </span>
            <select value={m.position} onChange={(e) => m.setPosition(e.target.value)}>
              {m.positions.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.setupRow}>
          <label className={styles.fld}>
            <span>지금 구단</span>
            <select
              value={m.curT}
              onChange={(e) => m.changeCurrentTeam(Number(e.target.value))}
            >
              <option value={T}>미정</option>
              {m.currentTeamOptions.map((ti) => (
                <option key={ti} value={ti}>
                  {TEAMS[ti].n}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.fld}>
            <span>지금 연도</span>
            <select
              value={m.curY}
              onChange={(e) => m.changeCurrentYear(Number(e.target.value))}
            >
              <option value={Y}>미정</option>
              {m.currentYearOptions.map((yi) => (
                <option key={yi} value={yi}>
                  {YEARS[yi]}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={styles.mini} onClick={m.clearCurrent}>
            둘 다 미정
          </button>
        </div>
      </div>

      <div className={styles.board}>
        <div className={styles.boardTop}>
          <b>{`${TEAMS[m.goalT].n} ${YEARS[m.goalY]}`}</b>
          <i>
            {m.curT < T || m.curY < Y
              ? `지금 ${teamName(m.curT)} ${yearName(m.curY)}`
              : "아직 아무것도 안 뽑은 상태"}
          </i>
        </div>

        <div className={`${styles.hero} ${hero.arrived ? styles.heroDone : ""}`}>
          <div className={styles.glyph}>{hero.glyph}</div>
          <div className={styles.verb}>{hero.verb}</div>
          <p className={styles.why}>{hero.why}</p>
        </div>

        {!hero.arrived && (
          <div className={styles.picks}>
            <h3>
              {hero.scope} {hero.total}개 중 {hero.shownCount}개가 뜹니다 · <b>이 순서로</b> 고르세요
            </h3>
            <div className={styles.pkrow}>
              {hero.picks.map((o) => (
                <span key={`${o.rank}-${o.name}`} className={pickClass(o, styles)}>
                  <i>{o.rank}</i>
                  {o.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={m.openTable}>
          구단 × 연도 표 보기
        </button>
        <button type="button" onClick={m.reroll}>
          지금 위치 무작위로
        </button>
      </div>
    </div>
  );
};

export default MileageScreen;
