import { useDispatch } from "react-redux";
import { requestInsertNewBoard } from "@/domains/community/store/index.js";
import { useForm } from "@/domains/community/feature/hooks/internal/useForm.js";

export const useBoardCreate = ({ onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = useForm({
    code: "",
    name: "",
    description: "",
    writeRole: "USER",
    readRole: "ALL",
    visible: true,
    deleted: false,
    sortOrder: 0,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await dispatch(requestInsertNewBoard(formHook.form));
    onSuccess?.();
  };

  return {
    ...formHook,
    handleSubmit,
  };
};
