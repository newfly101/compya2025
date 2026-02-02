import { useDispatch } from "react-redux";
import { useBoardForm } from "@/domains/community/feature/hooks/board/internal/useBoardForm.js";
import { requestInsertNewBoard } from "@/domains/community/store/index.js";

export const useBoardCreate = ({ onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = useBoardForm({
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
