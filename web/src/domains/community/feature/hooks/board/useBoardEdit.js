import { useDispatch } from "react-redux";
import { useBoardForm } from "@/domains/community/feature/hooks/board/internal/useBoardForm.js";
import { requestUpdateNewBoard } from "@/domains/community/store/index.js";

export const useBoardEdit = ({ board, onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = useBoardForm({
    code: board.code,
    name: board.name,
    description: board.description,
    writeRole: board.writeRole,
    readRole: board.readRole,
    visible: board.visible,
    deleted: board.deleted,
    sortOrder: board.sortOrder
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await dispatch(requestUpdateNewBoard({
      id: board.id,
      form: formHook.form
    }));

    onSuccess?.();
  };

  return {
    ...formHook,
    handleSubmit,
  };
};
