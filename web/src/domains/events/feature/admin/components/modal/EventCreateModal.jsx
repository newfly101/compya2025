import EventModal from "./EventModal.jsx";
import { useEventCreate } from "@/domains/events/feature/admin/hooks/useEventCreate.js";

const EventCreateModal = ({ onClose }) => {
  const hook = useEventCreate({
    onSuccess: onClose,
  });

  return (
    <EventModal
      title="이벤트 등록"
      submitLabel="등록"
      form={hook.form}
      onChange={hook.handleChange}
      onDateTyping={hook.handleDateTyping}
      onDateBlur={hook.handleDateBlur}
      onSubmit={hook.handleSubmit}
      onCancel={onClose}
      onImageTypeChange={hook.handleImageTypeChange}
      onFileChange={hook.handleFileChange}
    />
  );
};

export default EventCreateModal;
