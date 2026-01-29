import { useDispatch } from "react-redux";
import { requestInsertNewEvent } from "@/domains/events/store/index.js";
import { useEventForm } from "./internal/useEventForm.js";

export const useEventCreate = ({ onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = useEventForm({
    title: "",
    eventSource: "OFFICIAL",
    imageUrl: "",
    externalLink: "",
    startAt: "",
    expireAt: "",
    visible: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = formHook.validate();
    if (!result.valid) {
      alert(result.message);
      return;
    }

    await dispatch(requestInsertNewEvent(formHook.form));
    onSuccess?.();
  };

  return {
    ...formHook,
    handleSubmit,
  };
};
