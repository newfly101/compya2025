import styles from "@/domains/admin/pages/player/components/drawer/AdminDrawer.module.scss";

const AttributeField = ({ label, name, value, onChange }) => (
  <div className={styles.field}>
    <label>{label}</label>
    <input
      type="number"
      name={name}
      value={value}
      onChange={onChange}
    />
  </div>
);

export default AttributeField;
