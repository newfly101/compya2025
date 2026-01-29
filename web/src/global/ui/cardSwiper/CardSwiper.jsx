import React from "react";
import { Swiper } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import { EffectCoverflow } from "swiper/modules";

const CardSwiper = ({
                      onActiveIndexChange,
                      className,
                      children,
                    }) => {
  return (
    <Swiper
      modules={[EffectCoverflow]}
      effect="coverflow"
      grabCursor
      centeredSlides
      onSlideChange={(swiper) => onActiveIndexChange?.(swiper.activeIndex)}
      breakpoints={{
        0: { slidesPerView: 1.6, spaceBetween: 16 },
        768: { slidesPerView: 2.8, spaceBetween: 20 },
        1024: { slidesPerView: 3.4, spaceBetween: 24 },
      }}
      coverflowEffect={{
        rotate: 0, stretch: 0, depth: 120, modifier: 1.2, slideShadows: false,
      }}
      className={className}
    >
      {children}
    </Swiper>
  );
};

export default CardSwiper;
