import React from "react";
import RecommendSkillCard from "@/feature/dictionary/components/cards/RecommendSkillCard.jsx";
import NoRecommendSkillCard from "@/feature/dictionary/components/cards/NoRecommendSkillCard.jsx";

const RecommendModal = ({
                          isOpen,
                          hasRecommend,
                          selectedSkills,
                          combos,
                          onClose,
                        }) => {
  if (!isOpen) return null;

  return hasRecommend ? (
    <RecommendSkillCard
      isOpen
      selectedSkills={selectedSkills}
      combos={combos}
      onClose={onClose}
    />
  ) : (
    <NoRecommendSkillCard
      skill={selectedSkills.join(" + ")}
      onClose={onClose}
      mainText="해당 스킬 조합은 잘 사용되지 않습니다."
      subText="다른 스킬 조합을 추천드립니다."
    />
  );
};

export default RecommendModal;
