import React from "react";
import styles from "./AdminDrawer.module.scss";
import MetaSection from "@/domains/admin/pages/player/components/drawer/DrawerMetaSection.jsx";
import AttributeSection from "@/domains/admin/pages/player/components/drawer/DrawerAttributeSection.jsx";
const AdminPlayerDrawer = ({ mode, cardForm, onClose, onChange, onSubmit }) => {
  if (!mode) return null;

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <h2>{mode === "CREATE" ? "선수 등록" : "선수 수정"}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className={styles.drawerBody}>
          <MetaSection form={cardForm} onChange={onChange} />
          <AttributeSection form={cardForm} onChange={onChange} />
        </div>

        <div className={styles.drawerFooter}>
          <button onClick={onClose}>취소</button>
          <button onClick={onSubmit}>저장</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPlayerDrawer;
