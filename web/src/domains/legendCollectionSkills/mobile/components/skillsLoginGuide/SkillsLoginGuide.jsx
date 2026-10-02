import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useLoginRequiredModal } from "@/domains/authentication/hooks/useLoginRequiredModal.jsx";
import LegendTabs from "@/global/ui/mobile/legendTabs/LegendTabs.jsx";
import { skillsGuide } from "@/domains/legendCollectionSkills/config/skillsGuide.js";
import SkillCard from "@/domains/legendCollectionSkills/mobile/components/skillCard/SkillCard.jsx";
import "@/domains/legendCollectionSkills/mobile/legendCollectionSkills.tokens.scss";
import styles from "./SkillsLoginGuide.module.scss";

// 예시 카드 — 실제 데이터가 아니다 (라벨에 "예시" 표기). 스킬 요청은 보내지 않는다.
const EXAMPLE_SLOTS = [
  { name: "위압감", grade: "A", skillGrade: "레전드" },
  { name: "캡틴", grade: "B", skillGrade: "레전드" },
  { name: "배팅머신", grade: "C", skillGrade: "플래티넘" },
];

/** 비로그인이 /legend-collection-skills 로 들어왔을 때의 안내 화면 (REQ-LCSK-24, Figma legendContentFlow 07) */
const SkillsLoginGuide = () => {
  useDomainTopBar("레전드 재료");
  const { askLogin, loginModal } = useLoginRequiredModal();

  return (
    <>
    <LegendTabs guide={skillsGuide} />
    <div className={styles.screen}>
      <h1 className={styles.title}>스킬 기록은 로그인하면 쓸 수 있어요</h1>
      <p className={styles.text}>
        내 레전드 카드에 스킬 3개를 등록하고, 기본 강화·고추강·고고각을 적용해 보며 필요한 재료까지 한눈에 확인하는 화면이에요.
        기록은 로그인한 계정에 저장돼요.
      </p>
      <p className={styles.label}>이런 카드를 만들 수 있어요 (예시)</p>
      <div className={styles.example}>
        <SkillCard kind="hitter" team="롯데" name="전준호B" position="CF" enhanceCount={5} slots={EXAMPLE_SLOTS} />
      </div>
      <button type="button" className={styles.login} onClick={() => askLogin("skills")}>로그인하고 시작하기</button>
      <p className={styles.hint}>로그인하면 이 화면으로 바로 돌아와요.</p>
    </div>
    {loginModal}
    </>
  );
};

export default SkillsLoginGuide;
