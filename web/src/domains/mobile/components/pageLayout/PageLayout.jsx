// src/domains/mobile/components/PageLayout/PageLayout.jsx
import { useNavigate } from "react-router-dom";
import TopBar from "@/domains/mobile/components/TopBar/TopBar";
import styles from "./PageLayout.module.scss";

/**
 * 공통 페이지 레이아웃
 * - TopBar (page variant) 포함
 * - 스크롤 가능한 content 영역
 * - 모든 서브 페이지에서 재사용
 */
const PageLayout = ({ title, children, rightAction, onBack }) => {
  const navigate = useNavigate();

  const handleBack = onBack || (() => navigate(-1));

  return (
    <div className={styles.page}>
      <TopBar
        variant="page"
        title={title}
        onBack={handleBack}
        rightAction={rightAction}
      />
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
