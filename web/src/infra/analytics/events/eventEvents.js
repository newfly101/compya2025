import { pushEvent } from "@/infra/analytics/ga.js";

export const trackEventClick = (eventId, eventTitle, eventType, externalLink) => {
  pushEvent({
    event: 'event_clicked',
    event_type: eventType,
    event_id: eventId,
    event_title: eventTitle,
    event_external_link: externalLink,
  })
}
