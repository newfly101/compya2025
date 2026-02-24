import { useEventForm } from "@/domains/events/feature/admin/hooks/useEventForm.js";
import { requestAdminUpdateExEvent } from "@/domains/events/store/admin/thunks.js";

export const useEventEdit = ({ event, onSuccess }) => {
  return useEventForm({
    initialForm: {
      title: event.title,
      eventType: event.eventType,
      imageUrl: event.imageUrl ?? "",
      imageType: event.imageUrl ? "URL" : "FILE",
      imagePreview: event.imageUrl ?? "",
      imageFile: null,
      externalLink: event.externalLink,
      startAt: event.startAt,
      expireAt: event.expireAt,
      visible: event.visible,
    },
    submitThunk: requestAdminUpdateExEvent,
    onSuccess,
    eventId: event.id,
  });
};
