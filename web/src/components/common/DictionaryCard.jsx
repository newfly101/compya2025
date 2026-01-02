import { useNavigate } from "react-router-dom";
import styles from "@/styles/pages/dictionary/Dictionary.module.scss";

const DictionaryCard = ({
                          icon,
                          title,
                          desc = [],
                          link,
                          image,
                          disabled = false,
                        }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!disabled) navigate(link);
  };

  return (
    <div
      className={`${styles.card} ${disabled ? styles.disabled : ""}`}
      onClick={handleClick}
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



export default DictionaryCard;
