// WikiScreen.jsx — ENC-0 카테고리 entry (9칸 그리드)
// /wiki — public, TopBar variant=section
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { RenewalNoticeModal } from "@/global/ui/renewalNoticeModal";
import { WIKI_CATEGORIES } from "@/domains/wiki/config/WIKI_CATEGORIES.js";
import styles from "./WikiScreen.module.scss";

export default function WikiScreen() {
  useDomainTopBar("추천 백과사전");
  const navigate = useNavigate();
  const [renewalOpen, setRenewalOpen] = useState(false);

  const handleCardClick = (category) => {
    if (category.comingSoon) {
      setRenewalOpen(true);
      return;
    }
    navigate(category.to);
  };

  return (
    <main className={styles.page}>
      <div className={styles.grid}>
        {WIKI_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`${styles.card} ${cat.comingSoon ? styles.cardDisabled : ""}`}
            onClick={() => handleCardClick(cat)}
            aria-label={cat.comingSoon ? `${cat.label.replace("\n", " ")} (준비중)` : cat.label.replace("\n", " ")}
          >
            <span className={styles.cardIcon}>{cat.icon}</span>
            <span className={styles.cardLabel}>{cat.label}</span>
            {cat.comingSoon && (
              <span className={styles.cardBadge}>준비중</span>
            )}
          </button>
        ))}
      </div>

      <RenewalNoticeModal
        isOpen={renewalOpen}
        onClose={() => setRenewalOpen(false)}
        message={"준비 중입니다.\n빠른 시일 내에 만나뵙겠습니다."}
      />
    </main>
  );
}
