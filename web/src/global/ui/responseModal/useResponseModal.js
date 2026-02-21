import { useState, useCallback } from "react";

export const useResponseModal = () => {
  const [state, setState] = useState({
    open: false,
    success: true,
    message: "",
  });

  const openResponseModal = useCallback(({ success, message }) => {
    setState({
      open: true,
      success,
      message,
    });
  }, []);

  const closeResponseModal = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  return {
    ...state,
    openResponseModal,
    closeResponseModal,
  };
};
