import { useState } from "react";

export const useBoardModal = () => {
  const [form, setForm] = useState(initialBoardForm);

  const initialBoardForm = {
    code: "",
    name: "",
    description: "",
    writeRole: "USER",
    readRole: "ALL",
    isVisible: true,
    isDeleted: false,
    sortOrder: 0,
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };



  return {
    initialBoardForm,
    handleChange,
    form,
  };
}
