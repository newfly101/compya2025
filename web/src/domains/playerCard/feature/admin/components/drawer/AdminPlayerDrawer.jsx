import React, { useEffect } from "react";
import styles from "./AdminDrawer.module.scss";
import MetaSection from "@/domains/playerCard/feature/admin/components/drawer/DrawerMetaSection.jsx";
import AttributeSection from "@/domains/playerCard/feature/admin/components/drawer/DrawerAttributeSection.jsx";
import { useDispatch } from "react-redux";
import { requestAdminPlayerCardTeamLists } from "@/domains/playerCard/store/admin/thunks.js";
import { useFormFormats } from "@/domains/playerCard/utils/useFormFormats.js";
const AdminPlayerDrawer = ({ mode, cardForm, onClose, onChange, onSubmit }) => {
  const dispatch = useDispatch();
  const { formatBirthDate, parseArray, stringifyArray } = useFormFormats();

  const handleBirthDateChange = (e) => {
    const formatted = formatBirthDate(e.target.value);

    onChange({
      target: {
        name: "birthDate",
        value: formatted,
      },
    });
  };

  const handleMultiSelect = (e) => {
    const { name, selectedOptions } = e.target;

    const values = Array.from(selectedOptions).map((opt) => opt.value);

    onChange({
      target: {
        name,
        value: JSON.stringify(values),
      },
    });
  };



  useEffect(() => {
    dispatch(requestAdminPlayerCardTeamLists());
  }, []);

  if (!mode) return null;

  return (
    <div className={styles.drawerOverlay} onClick={onClose}>
      <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.drawerHeader}>
          <h2>{mode === "CREATE" ? "선수 등록" : "선수 수정"}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <div className={styles.drawerBody}>
          <MetaSection form={cardForm} onChange={onChange} onBirthDateChange={handleBirthDateChange} onMultiChange={handleMultiSelect} />
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
