// global/ui/guideAccordion/GuideAccordion.jsx
// 콘텐츠 화면 최상단에 붙는 "접힌 가이드" 아코디언 — 프리렌더 스냅샷에도 본문이 그대로
// 구워지도록 <details>/<summary> 네이티브 시맨틱만 쓴다. {open && <GuideContent/>} 같은
// 조건부 렌더는 절대 쓰지 않는다 — 닫힌 상태에서도 본문이 DOM에 있어야 크롤러가 읽는다.
// GuideModal 과 같은 이유로(글로벌 부품이 도메인 데이터를 직접 아는 구조를 피하기 위해)
// slug 조회는 하지 않는다 — 화면 쪽이 GUIDES_BY_SLUG 에서 guide 객체를 조회해 넘긴다.
import GuideContent from "@/global/ui/guideContent/GuideContent.jsx";
import styles from "./GuideAccordion.module.scss";

const GuideAccordion = ({ guide }) => {
  if (!guide) return null;

  return (
    <details className={styles.accordion}>
      <summary className={styles.summary}>
        <span className={styles.icon} aria-hidden="true">
          📖
        </span>
        <span className={styles.label}>이 페이지 활용 가이드</span>
      </summary>
      <div className={styles.body}>
        <GuideContent guide={guide} headingLevel="h2" />
      </div>
    </details>
  );
};

export default GuideAccordion;
