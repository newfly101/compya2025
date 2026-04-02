import { useEffect, useState } from "react";
import { requestAdminPlayerCardTeamLists } from "@/domains/playerCard/store/admin/thunks.js";
import { useDispatch } from "react-redux";
import { useFormFormats } from "@/domains/playerCard/utils/useFormFormats.js";

export const useAdminPlayerMeta = ({ onClose, onChange }) => {

  //   onClose,
  //   onChange,
  //   onSubmit,

  const dispatch = useDispatch();
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const { formatBirthDate } = useFormFormats();

  useEffect(() => {
    dispatch(requestAdminPlayerCardTeamLists());
  }, [dispatch]);

  const handleConfirmClose = () => {
    setConfirmCloseOpen(false);
    onClose(); // 실제 닫기 실행
  };

  const handleCancelClose = () => {
    setConfirmCloseOpen(false);
  };

  const handleBirthDateChange = (e) => {
    const formatted = formatBirthDate(e.target.value);

    onChange({
      target: {
        name: "birthDate",
        value: formatted,
      },
    });
  };

  return {
    confirmCloseOpen,
    setConfirmCloseOpen,
    handleConfirmClose,
    handleCancelClose,
    handleBirthDateChange
  }
};
