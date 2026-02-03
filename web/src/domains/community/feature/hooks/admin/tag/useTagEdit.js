import { useDispatch } from "react-redux";
import { requestUpdateNewTag } from "@/domains/community/store/index.js";
import { useForm } from "@/domains/community/feature/hooks/internal/useForm.js";

export const useTagEdit = ({ tag, onSuccess }) => {
  const dispatch = useDispatch();

  const formHook = useForm({
    code: tag.code,
    name: tag.name,
    description: tag.description,
    visible: tag.visible,
    deleted: tag.deleted
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    await dispatch(requestUpdateNewTag({
      id: tag.id,
      form: formHook.form
    }));

    onSuccess?.();
  };

  return {
    ...formHook,
    handleSubmit,
  };
};
