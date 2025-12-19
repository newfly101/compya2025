import React from "react";
import EventCard from "@/components/common/EventCard.jsx";
import styles from "@/styles/layout/EventCard.module.scss";
import { parseDate } from "@/utils/parseDate.js";
import { sortCoupons } from "@/utils/sortCoupons.js";

const EventList = ({ data, limit, short = false }) => {
  const sorted = sortCoupons(data);
  const now = new Date();

  const finalList = limit ? sorted.slice(0, limit) : sorted;

  return (
    <div>{!short && "🎉 이벤트 리스트"}
      <div className={`${short ? styles.shortGrid : styles.grid}`}>
        {finalList.map((item) => {
          const expired = parseDate(item.expireDate) < now;

          return (
            <EventCard
              key={item.id}
              title={item.title}
              image={item.image}
              dateRange={item.dateRange}
              link={item.link}
              short={short}
              disabled={expired}
            />
          );
        })}
      </div>
    </div>

  );
};

export default EventList;
