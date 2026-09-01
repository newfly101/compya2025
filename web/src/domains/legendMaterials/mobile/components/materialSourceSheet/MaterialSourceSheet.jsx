import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { SOURCE_META } from "@/domains/legendMaterials/config/legendMaterials.js";
import styles from "./MaterialSourceSheet.module.scss";

/**
 * 획득처 상세 — 하단 시트.
 * 히스토리모드일 때만 「히스토리 탐색기로 이동」 버튼이 추가된다.
 * 마일리지 저격은 컨텐츠가 아직 없어 확인 버튼만 둔다.
 *
 * @param {{ material: {name: string, source: {type: string}} | null, onClose: () => void }} props
 */
const MaterialSourceSheet = ({ material, onClose }) => {
  useEffect(() => {
    if (!material) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [material, onClose]);

  const navigate = useNavigate();
  if (!material?.source) return null;

  const { source } = material;
  const meta = SOURCE_META[source.type];
  if (!meta) return null;

  const isHistory = source.type === "HISTORY";
  const toneClass = isHistory ? styles.toneHistory : styles.toneMileage;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={`${material.name} 획득처`}>
      <button type="button" className={styles.backdrop} onClick={onClose} aria-label="닫기" />

      <div className={styles.sheet}>
        <div className={styles.head}>
          <div className={styles.headText}>
            <span className={`${styles.chip} ${toneClass}`}>{meta.label}</span>
            <p className={styles.name}>{material.name}</p>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </div>

        <p className={styles.desc}>{meta.desc}</p>

        <div className={styles.table}>
          {meta.rows(source).map((r) => (
            <div key={r.k} className={styles.row}>
              <span className={styles.rowKey}>{r.k}</span>
              <span className={styles.rowValue}>{r.v}</span>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.confirm} onClick={onClose}>
            확인
          </button>
          {isHistory && (
            <button
              type="button"
              className={styles.goHistory}
              onClick={() => navigate(ROUTE_PATHS.history_mode)}
            >
              히스토리 탐색기로 이동
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialSourceSheet;
