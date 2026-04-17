import { pushEvent } from "@/app/analytics/ga.js";

export const trackEventClick = (eventId, eventTitle,eventType) => {
  pushEvent({
    event: 'event_clicked',
    event_type: eventType,
    event_id: eventId,
    event_title: eventTitle,
  })
}
