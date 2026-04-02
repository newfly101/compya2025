import styles from "@/domains/playerCard/feature/admin/components/drawer/AdminDrawer.module.scss";
import React from "react";
import AttributeField from "@/domains/playerCard/feature/admin/components/drawer/AttributeField.jsx";
import { ATTRIBUTE_CONFIG } from "@/domains/playerCard/config/PlayerTableConfig.js";

const DrawerAttributeSection = ({ formState, formActions }) => {
  const { form } = formState;
  const { handleChange } = formActions;

  const role = form.meta.role;
  const attributes = ATTRIBUTE_CONFIG[role] ?? [];

  return (
    <div className={styles.sectionWrapper}>
      {role && <h3 className={styles.sectionTitle}>능력치</h3>}

      <div className={styles.attributeGrid}>
        {attributes.map(({ label, name }) => (
          <AttributeField
            key={name}
            label={label}
            name={name}
            value={form.attributes[name] || 0}
            onChange={handleChange}
          />
        ))}
      </div>
    </div>
  );
};

export default DrawerAttributeSection;
