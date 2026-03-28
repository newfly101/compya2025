import { useState } from "react";

export const useAdminUserForm = (initialUser) => {
  const [role, setRole] = useState(initialUser.role);
  const [status, setStatus] = useState(initialUser.status);
  const [banReason, setBanReason] = useState("");

  const handleSave = (userId) => {
    // TODO: API 호출
    console.log({ userId, role, status, banReason });
    alert("변경 사항이 저장되었습니다.");
  };

  return {
    role, setRole,
    status, setStatus,
    banReason, setBanReason,
    handleSave,
  };
};
