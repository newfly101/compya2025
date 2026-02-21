import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ResponseModal } from "@/global/ui/responseModal/index.js";
import { clearLastOperation } from "@/app/store/operation/slices.jsx";

const ResponseListener = () => {
  const dispatch = useDispatch();
  const lastOperation = useSelector((state) => state.operation.lastOperation);

  if (!lastOperation) return null;

  return (
    <ResponseModal
      open={true}
      success={lastOperation.success}
      message={lastOperation.message}
      onClose={() => dispatch(clearLastOperation())}
    />
  );
};

export default ResponseListener;
