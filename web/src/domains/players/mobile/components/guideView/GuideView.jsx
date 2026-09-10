// domains/players/mobile/components/guideView/GuideView.jsx
// 최초 진입 가이드 + 도움말 화면. 메인 화면과 완전히 다른 레이아웃이라 별도 컴포넌트로 분리.
import styles from "./GuideView.module.scss";

const FEATURES = [
  {
    icon: "🔍",
    title: "이름 검색",
    desc: "이름을 입력하면 구단·연도와 상관없이 그 선수의 모든 카드가 한 번에 나옵니다.",
  },
  {
    icon: "필터",
    title: "필터로 골라보기",
    desc: "팀·포지션·카드 종류를 조합해 원하는 카드만 남길 수 있습니다. 타자 / 투수 / 코치 탭은 결과에 따라 자동으로 열리고 닫힙니다.",
  },
  {
    icon: "L",
    title: "레전드 재료 표시",
    desc: "L 마크가 붙은 카드는 레전드 카드의 재료입니다. 마크를 누르면 어떤 레전드의 재료인지 보여주고, '재료만 보기'로 이 카드만 모아볼 수 있습니다.",
  },
  {
    icon: "grade",
    title: "최고 등급 보기",
    desc: "기본은 노말 카드로 보이며, 켜면 해당 카드가 도달할 수 있는 최고 등급(플래티넘)으로 바뀝니다.",
  },
];

const GuideView = ({ primaryLabel, onSubmit }) => (
  <div className={styles.wrap}>
    <div className={styles.scroll}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>PLAYER ENCYCLOPEDIA</p>
        <h1 className={styles.title}>
          1982년부터 2026년까지,
          <br />
          모든 구단의 선수·코치 카드
        </h1>
        <p className={styles.desc}>
          구단과 연도를 고르면 그 시즌의 카드가 실제 게임과 같은 카드 형태로 정렬됩니다. 선수 이미지는
          저작권 문제로 실루엣으로 대체되어 있습니다.
        </p>
      </div>

      <div className={styles.featureList}>
        {FEATURES.map((f) => (
          <div className={styles.featureRow} key={f.title}>
            <div className={styles.featureIcon}>
              {f.icon === "L" ? <span className={styles.lMark}>L</span> : f.icon === "grade" ? (
                <span className={styles.gradeMark} aria-hidden="true" />
              ) : (
                f.icon
              )}
            </div>
            <div>
              <p className={styles.featureTitle}>{f.title}</p>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p>
          선수·코치 13,954장 · 20개 구단 · 1982–2026
          <br />
          버튼을 누르면 카드 데이터를 불러옵니다.
        </p>
        <div className={styles.noticeBadge}>
          <span className={styles.noticeDot} aria-hidden="true" />
          2026.09.10 일반 카드만 추가되어 있습니다.
        </div>
      </div>
    </div>

    <div className={styles.ctaWrap}>
      <button type="button" className={styles.ctaButton} onClick={onSubmit}>
        {primaryLabel}
      </button>
    </div>
  </div>
);

export default GuideView;
