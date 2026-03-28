import { useState } from "react";

const CLOSE_ANIMATION_DURATION = 250;

export const useCloseGuard = ({ onClose }) => {
  const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const requestClose = () => {
    setConfirmCloseOpen(true);
  };

  const confirmClose = () => {
    setConfirmCloseOpen(false);
    setIsClosing(true);

    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, CLOSE_ANIMATION_DURATION);
  };

  const cancelClose = () => {
    setConfirmCloseOpen(false);
  };

  return {
    confirmCloseOpen,
    isClosing,
    requestClose,
    confirmClose,
    cancelClose,
  };
};
