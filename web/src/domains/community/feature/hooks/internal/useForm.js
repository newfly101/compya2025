import { useState } from "react";

export const useForm = (initialForm) => {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return {
    form,
    setForm,
    handleChange,
  }
}
