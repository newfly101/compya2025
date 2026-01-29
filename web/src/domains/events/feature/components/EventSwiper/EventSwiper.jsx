import { useEventListUser } from "@/domains/events/feature/hooks/user/useEventListUser.js";
import { CardSwiper } from "@/global/ui/cardSwiper/index.js";
import { SwiperSlide } from "swiper/react";
import { CafeLinkCard } from "@/global/ui/cafeLinkCard/index.js";
import React from "react";

const EventSwiper = (short = false) => {
  const { activeEvents } = useEventListUser();

  if (activeEvents.length === 0) return null;

  return (
    <CardSwiper>
      {activeEvents.map(e => (
        <SwiperSlide key={e.id}>
          <CafeLinkCard
            key={e.id}
            title={e.title}
            image={e.imageUrl}
            dateRange={`${e.startAt} ~ ${e.expireAt}`}
            link={e.externalLink}
            short={short}
          />
        </SwiperSlide>
      ))}
    </CardSwiper>
  );
};

export default EventSwiper;
