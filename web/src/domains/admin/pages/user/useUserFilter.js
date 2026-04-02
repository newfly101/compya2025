import { useMemo, useState } from "react";

export const useUserFilter = (users = []) => {
  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [sortKey, setSortKey] = useState("createdAt");

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => (keyword ? u.email.includes(keyword) || u.nickname.includes(keyword) : true))
      .filter((u) => (role === "ALL" ? true : u.role === role))
      .filter((u) => (status === "ALL" ? true : u.status === status))
      .sort((a, b) => new Date(b[sortKey]) - new Date(a[sortKey]));
  }, [users, keyword, role, status, sortKey]);

  return {
    keyword, setKeyword,
    role, setRole,
    status, setStatus,
    sortKey, setSortKey,
    filteredUsers,
  };
};
