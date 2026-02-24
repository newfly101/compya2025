import { requestInsertNewEvent } from "@/domains/events/store/index.js";
import { useEventForm } from "./useEventForm.js";

export const useEventCreate = ({ onSuccess }) => {
  return useEventForm({
    initialForm: {
      title: "",
      eventSource: "OFFICIAL",
      imageUrl: "",
      imageType: "URL",
      imagePreview: "",
      imageFile: null,
      externalLink: "",
      startAt: "",
      expireAt: "",
      visible: true,
    },
    submitThunk: requestInsertNewEvent,
    onSuccess,
  });
};
