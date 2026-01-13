import React from "react";
import RecommendCard from "@/feature/dictionary/components/cards/recommendCard/RecommendCard.jsx";
import NoRecommendSkillCard from "@/feature/dictionary/components/cards/NoRecommendSkillCard.jsx";

const RecommendModal = ({
                          isOpen,
                          matched,
                          selected,
                          combos,
                          onClose,
                        }) => {
  if (!isOpen) return null;

  return matched ? (
    <RecommendCard
      isOpen
      selected={selected}
      combos={combos}
      onClose={onClose}
    />
  ) : (
    <NoRecommendSkillCard
      skill={selected.join(" + ")}
      onClose={onClose}
      mainText="해당 스킬 조합은 잘 사용되지 않습니다."
      subText="다른 스킬 조합을 추천드립니다."
    />
  );
};

export default RecommendModal;
