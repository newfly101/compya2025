import EventModal from "./EventModal.jsx";
import { useEventEdit } from "@/domains/events/feature/hooks/admin/useEventEdit.js";

const EventEditModal = ({ event, onClose }) => {
  const hook = useEventEdit({
    event,
    onSuccess: onClose,
  });

  return (
    <EventModal
      title="이벤트 수정"
      submitLabel="수정"
      form={hook.form}
      onChange={hook.handleChange}
      onDateTyping={hook.handleDateTyping}
      onDateBlur={hook.handleDateBlur}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
    />
  );
};

export default EventEditModal;
