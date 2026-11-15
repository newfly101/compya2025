"use client";
import { useState } from "react";
import ImageLightbox from "@/domains/notices/mobile/components/imageLightbox/ImageLightbox.jsx";
import styles from "@/domains/notices/mobile/NoticeDetailScreen.module.scss";

// 히어로 이미지 + 클릭 시 라이트박스 — 상호작용이 있어 이 부분만 클라이언트 컴포넌트.
const NoticeHero = ({ imageUrl, title }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className={styles.hero}>
        {imageUrl ? (
          <button type="button" className={styles.heroBtn} onClick={() => setOpen(true)} aria-label="공지 이미지 크게 보기">
            <img src={imageUrl} alt={title} className={styles.heroImg} />
          </button>
        ) : (
          <div className={styles.heroEmpty} />
        )}
      </div>
      <ImageLightbox open={open} imageUrl={imageUrl} alt={title} onClose={() => setOpen(false)} />
    </>
  );
};

export default NoticeHero;
