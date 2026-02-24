import { useState } from "react";
import { parseDateInput } from "@/global/utils/datetime/parseDateInput.js";
import { formatDateTyping } from "@/global/utils/datetime/formatDateTyping.js";
import { validateModalDate } from "@/global/utils/datetime/validateModalDate.js";
import { useDispatch } from "react-redux";
import { requestAdminUploadEventImage } from "@/domains/events/store/admin/thunks.js";

export const useEventForm = ({
                               initialForm,
                               submitThunk,
                               onSuccess,
                               eventId
}) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState(initialForm);

  const setField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };

  const handleImageTypeChange = (type) => {
    setField("imageType", type);
  };

  const handleFileChange = (file) => {
    if (!file) return;

    const preview = URL.createObjectURL(file);

    setField("imageFile", file);
    setField("imagePreview", preview);
  };

  const handleDateTyping = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: formatDateTyping(value),
    }));
  };

  const handleDateBlur = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: parseDateInput(value),
    }));
  };

  const validate = () =>
    validateModalDate.event({
      startAt: form.startAt,
      expireAt: form.expireAt,
    });

  // url 앞에 https 붙이는 function
  const normalizeUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `https://${url}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = validate();
    if (!result.valid) {
      alert(result.message);
      return;
    }

    try {
      let imageUrl = form.imageUrl;

      if (form.imageType === "FILE" && form.imageFile) {
        imageUrl = await dispatch(
          requestAdminUploadEventImage(form.imageFile)
        ).unwrap();
      }

      const payload = {
        ...form,
        imageUrl: normalizeUrl(imageUrl),
      };

      delete payload.imageFile;
      delete payload.imagePreview;

      await dispatch(
        submitThunk(
          eventId
            ? { id: eventId, ...payload }
            : payload
        )
      ).unwrap();

      onSuccess?.();
    } catch (err) {}
  };

  return {
    form,
    setForm,
    handleChange,
    handleDateTyping,
    handleDateBlur,
    handleSubmit,
    handleImageTypeChange,
    handleFileChange
  };
};
