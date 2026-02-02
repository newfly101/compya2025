import { useMemo, useState } from "react";

export const DEFAULT_BOARDS = [
  {
    code: "TIP",
    name: "팁",
    description: "유용한 공략과 팁을 공유하세요",
    writeRole: "ADMIN",
  },
  {
    code: "FREE",
    name: "자유",
    description: "자유롭게 이야기해요",
    writeRole: "USER",
  },
  {
    code: "CLUB",
    name: "클럽",
    description: "클럽 관련 이야기",
    writeRole: "USER",
  },
];

export const useBoards = () => {
  // 🔹 렌더링마다 새 배열 만들지 않게 memo
  const boards = useMemo(() => DEFAULT_BOARDS, []);

  return {
    boards
  };
};
