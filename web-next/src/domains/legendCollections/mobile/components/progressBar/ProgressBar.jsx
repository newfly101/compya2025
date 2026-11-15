import { SLOT_COUNT } from "@/domains/legendCollections/config/legendCollections.js";
import styles from "./ProgressBar.module.scss";

/** 8칸 진행 막대 — 삽입(진한 보라) → 보유(옅은 보라) → 미보유(회색) 순으로 채운다 */
const ProgressBar = ({ inserted, have }) => (
  <div
    className={styles.bar}
    role="img"
    aria-label={`재료 ${SLOT_COUNT}칸 중 삽입 ${inserted} · 보유 ${have}`}
  >
    {Array.from({ length: SLOT_COUNT }, (_, i) => (
      <span key={i} data-kind={i < inserted ? "inserted" : i < inserted + have ? "have" : "none"} />
    ))}
  </div>
);

export default ProgressBar;
