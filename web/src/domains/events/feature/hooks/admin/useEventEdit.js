import { useDispatch } from "react-redux";
import { requestUpdateExternalEvent } from "@/domains/events/store/index.js";
import { useEventForm } from "./internal/useEventForm.js";

export const useEventEdit = ({ event, onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = useEventForm({
    title: event.title,
    eventSource: event.eventSource,
    imageUrl: event.imageUrl,
    externalLink: event.externalLink,
    startAt: event.startAt,
    expireAt: event.expireAt,
    visible: event.visible,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = formHook.validate();
    if (!result.valid) {
      alert(result.message);
      return;
    }

    await dispatch(
      requestUpdateExternalEvent({
        id: event.id,
        ...formHook.form,
      })
    );

    onSuccess?.();
  };

  return {
    ...formHook,
    handleSubmit,
  };
};
