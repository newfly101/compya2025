// domains/players/mobile/components/guideView/GuideView.jsx
// 최초 진입 가이드 + 도움말 화면. 메인 화면과 완전히 다른 레이아웃이라 별도 컴포넌트로 분리.
// design_handoff README §1(21~32행) 기준 — 항목 5개(카드형·리스트형 전환은 하위 2모드 포함).
import styles from "./GuideView.module.scss";

const FEATURES = [
  {
    icon: "🔍",
    title: "이름 검색",
    desc: "전체 구단·연도에서 이름으로 찾습니다.",
    boxes: [
      {
        lines: ["결과: 그 선수의 모든 연도 카드", "검색 중엔 구단·연도 선택이 잠김", "카드 하단에 구단 · 연도 표시"],
      },
    ],
  },
  {
    icon: "view",
    title: "카드형 · 리스트형 전환",
    desc: "탭 오른쪽 토글로 전환하며, 선택은 기억됩니다.",
    modes: [
      {
        label: "카드형",
        desc: "게임과 같은 카드 모양으로 한 줄에 5장씩 봅니다.",
        boxes: [
          { title: "정렬", lines: ["레전드 재료(L) 우선", "그다음 포지션 순 → 이름 순"] },
          { title: "표시", lines: ["카드 하단: 연도 · 포지션", "전체 / 타자 / 투수 / 코치 모든 탭에서 사용"] },
        ],
      },
      {
        label: "리스트형",
        desc: "타자 또는 투수 탭에서만 켜집니다. 선수를 표로 놓고 능력치를 비교합니다.",
        boxes: [
          {
            title: "표시 열",
            lines: [
              "타자: 정확 · 파워 · 선구 · 주력 · 수비",
              "투수: 제구 · 구위 · 체력 · 직구 · 변화",
              "OVR: 스탯 5개 평균(소수 한 자리) — 타자·투수 공통",
              "투수 구종 등급: 10종, S~D (토글)",
            ],
          },
          { title: "정렬", lines: ["열 제목 탭 → ▲ 오름차순 / ▼ 내림차순", "스탯 ↔ 구종 등급 전환 시 순서 유지"] },
          {
            title: "화면",
            lines: [
              "왼쪽(순번·구단·연도·이름)까지 폭에 맞춰 한 화면에 표시",
              "오른쪽 능력치 열은 항상 전부 표시",
              "최고 능력치(70+)는 민트색",
            ],
          },
        ],
      },
    ],
  },
  {
    icon: "필터",
    title: "필터로 골라보기",
    desc: "조건을 조합해 원하는 카드만 남깁니다.",
    boxes: [
      {
        lines: ["조건: 팀 · 포지션 · 카드 종류 · 재료만", "적용 중이면 필터 버튼이 보라색 + 개수", "결과가 0인 타자/투수/코치 탭은 자동 비활성"],
      },
    ],
  },
  {
    icon: "L",
    title: "레전드 재료 표시",
    desc: "L 마크 카드는 레전드 카드의 재료입니다.",
    boxes: [
      {
        lines: ["L 마크 탭 → 어떤 레전드의 재료인지 표시", "'재료만 보기' → L 카드만 모아보기", "리스트형에서는 이름 옆에 L 표시"],
      },
    ],
  },
  {
    icon: "grade",
    title: "최고 등급 보기",
    desc: "카드를 도달 가능한 최고 등급으로 봅니다.",
    boxes: [
      { lines: ["기본: 노말 → 켜면: 플래티넘", "카드형 이미지·등급 표기만 변경", "리스트형 능력치는 그대로"] },
    ],
  },
];

const FeatureIcon = ({ icon }) => {
  if (icon === "L") return <span className={styles.lMark}>L</span>;
  if (icon === "grade") return <span className={styles.gradeMark} aria-hidden="true" />;
  if (icon === "view")
    return (
      <span className={styles.viewIconWrap} aria-hidden="true">
        <span className={styles.viewIconGrid}>
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className={styles.viewIconList}>
          <i />
          <i />
          <i />
        </span>
      </span>
    );
  return icon;
};

const BoxList = ({ boxes }) => (
  <>
    {boxes.map((b) => (
      <div className={styles.subBox} key={b.title ?? b.lines[0]}>
        {b.title && <p className={styles.subBoxTitle}>{b.title}</p>}
        <p className={styles.subBoxLines}>
          {b.lines.map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}· {line}
            </span>
          ))}
        </p>
      </div>
    ))}
  </>
);

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
              <FeatureIcon icon={f.icon} />
            </div>
            <div>
              <p className={styles.featureTitle}>{f.title}</p>
              <p className={styles.featureDesc}>{f.desc}</p>

              {f.boxes && (
                <div className={styles.subBoxList}>
                  <BoxList boxes={f.boxes} />
                </div>
              )}

              {f.modes &&
                f.modes.map((m) => (
                  <div key={m.label}>
                    <div className={styles.modeRow}>
                      <span className={styles.modeLabel}>{m.label}</span>
                      <span className={styles.modeDesc}>{m.desc}</span>
                    </div>
                    <div className={styles.subBoxList}>
                      <BoxList boxes={m.boxes} />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        {/* 13,954장 · 2026.09.10 은 핸드오프 시점 스냅샷 문구다. 이 화면은 「이용하기」 클릭 전
            (API 호출 전) 렌더되어 실측 장수를 알 수 없어 하드코딩을 유지한다 — README Data 절 그대로. */}
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
