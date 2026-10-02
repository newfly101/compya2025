import { useLoginRequiredModal } from "@/domains/authentication/hooks/useLoginRequiredModal.jsx";
import { collectionsGuide } from "@/domains/legendCollections/config/collectionsGuide.js";
import LegendTabs from "@/global/ui/mobile/legendTabs/LegendTabs.jsx";
import styles from "./CollectionsLoginGuide.module.scss";

/** 비로그인이 /legend-collections/manage 로 들어왔을 때의 안내 화면 — 튕기지 않고 같은 주소에서 안내 + 로그인 모달 (스킬 기록 안내와 같은 방식) */
const CollectionsLoginGuide = ({ title, text }) => {
  const { askLogin, loginModal } = useLoginRequiredModal();
  return (
    <>
      <LegendTabs guide={collectionsGuide} />
      <div className={styles.screen}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
        <button type="button" className={styles.login} onClick={() => askLogin("edit")}>
          로그인하고 시작하기
        </button>
        <p className={styles.hint}>로그인하면 이 화면으로 바로 돌아와요.</p>
      </div>
      {loginModal}
    </>
  );
};

export default CollectionsLoginGuide;
