import { useState } from "react";
import { parseDateInput } from "@/global/utils/datetime/parseDateInput";
import { formatDateTyping } from "@/global/utils/datetime/formatDateTyping";
import { validateEventDate } from "@/global/utils/datetime/validateEventDate";

export const useEventForm = (initialForm) => {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDateTyping = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: formatDateTyping(value) }));
  };

  const handleDateBlur = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: parseDateInput(value) }));
  };

  const validate = () =>
    validateEventDate({
      startAt: form.startAt,
      expireAt: form.expireAt,
    });

  return {
    form,
    setForm,
    handleChange,
    handleDateTyping,
    handleDateBlur,
    validate,
  };
};
