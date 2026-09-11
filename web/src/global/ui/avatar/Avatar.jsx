import { useState } from "react";
import styles from "./Avatar.module.scss";

// 닉네임 첫 글자를 대체 표시로 쓴다 — 이미지가 없거나 깨졌을 때 빈 네모 대신 보여준다.
const initialOf = (nickname) => {
  const trimmed = (nickname ?? "").trim();
  return trimmed ? trimmed[0].toUpperCase() : "?";
};

/**
 * Avatar — 프로필 이미지 공용 부품.
 * 마이페이지뿐 아니라 앞으로 글쓰기 등 콘텐츠 화면에서도 재사용한다.
 *
 * - 원본 비율이 달라도 항상 정사각으로 잘라 채운다(object-fit: cover).
 * - src 가 없거나 로드에 실패(404/만료)하면 닉네임 첫 글자로 대체한다.
 *
 * @param {string} [src] - 프로필 이미지 주소
 * @param {string} [nickname] - 대체 표시에 쓸 닉네임
 * @param {number} [size=60] - 정사각 픽셀 크기 (표시 용도는 보통 58~60)
 * @param {string} [alt]
 */
const Avatar = ({ src, nickname, size = 60, alt = "" }) => {
  // 실패한 src 자체를 기억한다 — src 가 바뀌면(업로드 성공 등) effect 없이도
  // 자연히 "실패 안 함" 상태로 돌아온다.
  const [brokenSrc, setBrokenSrc] = useState(null);
  const showImage = !!src && src !== brokenSrc;

  return (
    <span
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {showImage ? (
        <img
          className={styles.image}
          src={src}
          alt={alt}
          onError={() => setBrokenSrc(src)}
        />
      ) : (
        <span className={styles.fallback}>{initialOf(nickname)}</span>
      )}
    </span>
  );
};

export default Avatar;
