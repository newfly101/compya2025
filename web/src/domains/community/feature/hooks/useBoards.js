import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestGetAllBoardLists } from "@/domains/community/store/index.js";

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
  const dispatch = useDispatch();
  const { boardLists } = useSelector((state) => state.community);

  useEffect(() => {
    dispatch(requestGetAllBoardLists());
  }, [dispatch])

  return {
    boards,
    boardLists
  };
};
