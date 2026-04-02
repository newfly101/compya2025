import { useEventForm } from "./useEventForm.js";
import { requestAdminInsertNewExEvent } from "@/domains/events/store/admin/thunks.js";

export const useEventCreate = ({ onSuccess }) => {
  return useEventForm({
    initialForm: {
      title: "",
      eventType: "OFFICIAL",
      imageUrl: "",
      imageType: "URL",
      imagePreview: "",
      imageFile: null,
      externalLink: "",
      startAt: "",
      expireAt: "",
      visible: true,
    },
    submitThunk: requestAdminInsertNewExEvent,
    onSuccess,
  });
};
