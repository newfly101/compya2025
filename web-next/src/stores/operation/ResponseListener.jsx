"use client";
import { ResponseModal } from "@/components/responseModal/index.js";
import { useOperationStore } from "@/stores/operationStore.js";

const ResponseListener = () => {
  const lastOperation = useOperationStore((s) => s.lastOperation);
  const clear = useOperationStore((s) => s.clearLastOperation);

  if (!lastOperation) return null;
  return <ResponseModal open success={lastOperation.success} message={lastOperation.message} onClose={clear} />;
};

export default ResponseListener;
