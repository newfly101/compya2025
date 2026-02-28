import styles from "@/domains/playerCard/feature/admin/components/drawer/AdminDrawer.module.scss";
import React from "react";
import AttributeField from "@/domains/playerCard/feature/admin/components/drawer/AttributeField.jsx";

const DrawerAttributeSection = ({ form, onChange }) => (
  <div className={styles.sectionWrapper}>
    <h3 className={styles.sectionTitle}>능력치</h3>

    <div className={styles.attributeGrid}>

      {form.meta.role === "HITTER" && (
        <>
          <AttributeField label="정확" name="accuracy" value={form.attributes.accuracy} onChange={onChange} />
          <AttributeField label="파워" name="power" value={form.attributes.power} onChange={onChange} />
          <AttributeField label="선구" name="contact" value={form.attributes.contact} onChange={onChange} />
          <AttributeField label="주력" name="speed" value={form.attributes.speed} onChange={onChange} />
          <AttributeField label="수비" name="defense" value={form.attributes.defense} onChange={onChange} />
        </>
      )}

      {form.meta.role === "PITCHER" && (
        <>
          <AttributeField label="제구" name="control" value={form.attributes.control || 0} onChange={onChange} />
          <AttributeField label="구위" name="velocity" value={form.attributes.velocity || 0} onChange={onChange} />
          <AttributeField label="체력" name="stamina" value={form.attributes.stamina || 0} onChange={onChange} />
          <AttributeField label="직구" name="fastball" value={form.attributes.fastball || 0} onChange={onChange} />
          <AttributeField label="변화" name="breaking" value={form.attributes.breaking || 0} onChange={onChange} />
        </>
      )}

    </div>
  </div>
);

export default DrawerAttributeSection;
