import styles from "./NavigationCard.module.scss";
import { useNavigationCard } from "./useNavigationCard.jsx";

const NavigationCard = ({
                          icon,
                          title,
                          desc = [],
                          link,
                          image,
                          disabled = false,
                        }) => {
  const {
    moveTo
  } = useNavigationCard({link, disabled});

  return (
    <div
      className={`${styles.card} ${disabled ? styles.disabled : ""}`}
      onClick={() => moveTo(link)}
    >
      {/* 🔼 상단 이미지 고정 영역 */}
      <div className={styles.imageZone}>
        {image && (
          <img
            src={image}
            alt=""
            className={styles.image}
            draggable={false}
          />
        )}
      </div>

      {/* 🔽 텍스트 영역 */}
      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.icon}>{icon}</span>
          <h2 className={styles.title}>{title}</h2>
        </div>

        <ul className={styles.desc}>
          {desc.map((text, idx) => (
            <li key={idx}>• {text}</li>
          ))}
        </ul>

        <div className={styles.footer}>
          <span className={styles.enter}>
            {disabled ? "준비 중" : "입장하기 →"}
          </span>
        </div>
      </div>
    </div>
  );
};



export default NavigationCard;
