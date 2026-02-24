import { requestUpdateExternalEvent } from "@/domains/events/store/index.js";
import { useEventForm } from "@/domains/events/feature/admin/hooks/useEventForm.js";

export const useEventEdit = ({ event, onSuccess }) => {
  return useEventForm({
    initialForm: {
      title: event.title,
      eventSource: event.eventSource,
      imageUrl: event.imageUrl ?? "",
      imageType: event.imageUrl ? "URL" : "FILE",
      imagePreview: event.imageUrl ?? "",
      imageFile: null,
      externalLink: event.externalLink,
      startAt: event.startAt,
      expireAt: event.expireAt,
      visible: event.visible,
    },
    submitThunk: requestUpdateExternalEvent,
    onSuccess,
    eventId: event.id,
  });
};
