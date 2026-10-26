import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useLoginRequiredModal } from "@/domains/authentication/hooks/useLoginRequiredModal.jsx";
import SkillCard from "@/global/ui/skillCard/SkillCard.jsx";
import "@/domains/legendCollectionSkills/mobile/legendCollectionSkills.tokens.scss";
import styles from "./GsbLoginGuide.module.scss";

// 예시 카드 — 실제 데이터가 아니다 (라벨에 "예시" 표기). 서버 요청은 보내지 않는다.
const EXAMPLE_SLOTS = [
  { name: "위압감", skillGrade: "레전드" },
  { name: "캡틴", skillGrade: "레전드" },
  { name: "배팅머신", skillGrade: "플래티넘" },
];

/** 비로그인이 /simulators/gsb 로 들어왔을 때의 안내 화면 (Figma 05) */
const GsbLoginGuide = () => {
  useDomainTopBar("스킬 시뮬레이션");
  const { askLogin, loginModal } = useLoginRequiredModal();

  return (
    <>
      <div className={styles.screen}>
        <h1 className={styles.title}>스킬 시뮬레이션은 로그인하면 쓸 수 있어요</h1>
        <p className={styles.text}>
          레전드 선수를 골라 고급 고유능력 변경권과 고유능력 선택 변경권을 마음껏 돌려 볼 수 있어요.
          돌린 횟수와 마지막 스킬은 로그인한 계정에 저장돼요.
        </p>
        <p className={styles.label}>이런 카드를 만들 수 있어요 (예시)</p>
        <div className={styles.example}>
          <SkillCard kind="hitter" team="롯데" name="전준호B" position="CF" hideEnhance counts={{ gsb: 132, sel: 3 }} slots={EXAMPLE_SLOTS} />
        </div>
        <button type="button" className={styles.login} onClick={() => askLogin("simulator")}>
          로그인하고 시작하기
        </button>
        <p className={styles.hint}>로그인하면 이 화면으로 바로 돌아와요.</p>
      </div>
      {loginModal}
    </>
  );
};

export default GsbLoginGuide;
