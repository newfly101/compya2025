import { useId } from "react";
import styles from "./BallIcon.module.scss";

// 등급 야구공. 외부 이미지 없이 SVG 로 직접 그린다.
// size 16/24 는 단색(flat), 48 이상은 그라데이션·효과. 색은 모두 --color-tier-* (BallIcon.module.scss).
export default function BallIcon({ tier = 1, size = 24, className = "" }) {
  const gid = `ball-${useId().replace(/:/g, "")}`;
  const large = size >= 48;
  return (
    <svg
      className={`${styles.ball} ${large ? styles.large : ""} ${className}`}
      data-tier={tier}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {large && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className={styles.stopA} />
            <stop offset="0.5" className={styles.stopB} />
            <stop offset="1" className={styles.stopC} />
          </linearGradient>
        </defs>
      )}
      <circle cx="12" cy="12" r="10.5" className={styles.body} fill={large ? `url(#${gid})` : undefined} />
      {/* 실밥 — 좌우 두 줄 */}
      <path d="M6.2 4.2c2.6 2.2 3.6 5.1 3.6 7.8s-1 5.6-3.6 7.8" className={styles.seam} />
      <path d="M17.8 4.2c-2.6 2.2-3.6 5.1-3.6 7.8s1 5.6 3.6 7.8" className={styles.seam} />
      {large && <ellipse cx="8.5" cy="7.5" rx="3" ry="1.6" transform="rotate(-35 8.5 7.5)" className={styles.spark} />}
    </svg>
  );
}
