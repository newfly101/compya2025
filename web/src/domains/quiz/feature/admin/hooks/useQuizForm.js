import { useState } from "react";
import { useDispatch } from "react-redux";
import { requestAdminUploadQuizImage } from "@/domains/quiz/store/admin/thunks.js";

export const useQuizForm = ({ initialForm, submitThunk, onSuccess, quizId }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState(initialForm);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };

  const handleImageTypeChange = (type) => setField("imageType", type);

  const handleFileChange = (file) => {
    if (!file) return;
    setField("imageFile", file);
    setField("imagePreview", URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = form.imageUrl;

      if (form.imageType === "FILE" && form.imageFile) {
        imageUrl = await dispatch(requestAdminUploadQuizImage(form.imageFile)).unwrap();
      }

      const payload = { ...form, imageUrl };
      delete payload.imageFile;
      delete payload.imagePreview;
      delete payload.imageType;

      await dispatch(
        submitThunk(quizId ? { id: quizId, ...payload } : payload)
      ).unwrap();

      onSuccess?.();
    } catch (err) {}
  };

  return { form, handleChange, handleImageTypeChange, handleFileChange, handleSubmit };
};
