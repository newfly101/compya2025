"use client";
import { ResponseModal } from "@/global/ui/responseModal/index.js";
import { useOperationStore } from "@/store/operationStore.js";

const ResponseListener = () => {
  const lastOperation = useOperationStore((s) => s.lastOperation);
  const clear = useOperationStore((s) => s.clearLastOperation);

  if (!lastOperation) return null;
  return <ResponseModal open success={lastOperation.success} message={lastOperation.message} onClose={clear} />;
};

export default ResponseListener;
