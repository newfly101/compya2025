import { useState } from "react";
import { useDispatch } from "react-redux";

export const useCouponForm = ({ initialForm, submitThunk, onSuccess, couponId }) => {
  const dispatch = useDispatch();
  const [form, setForm] = useState(initialForm);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setField(name, type === "checkbox" ? checked : value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // datetime-local input 의 "yyyy-MM-ddTHH:mm" → BE 기대 포맷 "yyyy-MM-dd HH:mm" 정합
      const expireAt = form.expireAt ? String(form.expireAt).replace("T", " ") : null;
      const payload = { ...form, expireAt };
      await dispatch(
        submitThunk(couponId ? { id: couponId, ...payload } : payload)
      ).unwrap();
      onSuccess?.();
    } catch (err) {}
  };

  return { form, handleChange, handleSubmit };
};
