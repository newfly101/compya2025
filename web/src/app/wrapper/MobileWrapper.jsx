// src/app/wrapper/MobileWrapper.jsx
import { Suspense } from "react";
import styles from "./MobileWrapper.module.scss";

/**
 * children을 받아서 모바일 shell 안에 렌더
 * AppWrapper에서 <MobileWrapper><Outlet /></MobileWrapper> 로 사용
 */
const MobileWrapper = ({ children }) => {
  return (
    <div className={styles.mobileRoot}>
      <Suspense fallback={<div className={styles.loading}>로딩중...</div>}>
        {children}
      </Suspense>
    </div>
  );
};

export default MobileWrapper;
