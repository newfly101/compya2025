// src/domains/mobile/components/QuickNav/QuickNav.jsx
import { useNavigate } from "react-router-dom";
import styles from "./QuickNav.module.scss";

const DEFAULT_ITEMS = [
  { icon: "🎮", label: "스킬\n시뮬레이터", path: "/simulate" },
  { icon: "📖", label: "추천\n백과사전",   path: "/dictionary" },
  { icon: "⏱",  label: "히스토리\n모드",  path: "/mode/history" },
  { icon: "🏟",  label: "KBO\n승부예측",  path: "/kbo" },
];

/**
 * C/QuickNav — 홈 퀵 네비게이션 (4개 고정)
 */
const QuickNav = ({ items = DEFAULT_ITEMS }) => {
  const navigate = useNavigate();

  return (
    <nav className={styles.nav}>
      {items.map((item, i) => (
        <button
          key={i}
          className={styles.item}
          onClick={() => navigate(item.path)}
        >
          <span className={styles.iconBg}>
            <span className={styles.icon}>{item.icon}</span>
          </span>
          <span className={styles.label}>
            {item.label.split("\n").map((line, j) => (
              <span key={j}>
                {line}
                {j < item.label.split("\n").length - 1 && <br />}
              </span>
            ))}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default QuickNav;
