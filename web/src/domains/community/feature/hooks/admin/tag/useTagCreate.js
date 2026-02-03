import { useDispatch } from "react-redux";
import { requestInsertNewTag } from "@/domains/community/store/index.js";
import { useForm } from "@/domains/community/feature/hooks/internal/useForm.js";

export const useTagCreate = ({ onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = useForm({
    code: "",
    name: "",
    description: "",
    visible: true,
    deleted: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await dispatch(requestInsertNewTag(formHook.form));
    onSuccess?.();
  };

  return {
    ...formHook,
    handleSubmit,
  };
};
