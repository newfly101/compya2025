import React from "react";
import { formatDateTyping } from "@/global/utils/datetime/formatDateTyping.js";
import { parseDateInput } from "@/global/utils/datetime/parseDateInput.js";
import { validateModalDate } from "@/global/utils/datetime/validateModalDate.js";

export const useCouponForm = (initialForm) => {
  const [form, setForm] = React.useState(initialForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  const handleDateTyping = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: formatDateTyping(value) }));
  };

  const handleDateBlur = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: parseDateInput(value) }));
  };

  const validate = () =>
    validateModalDate.coupon({
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
}
