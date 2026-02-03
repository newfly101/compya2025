import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestGetAllTagLists } from "@/domains/community/store/index.js";


export const useTag = () => {
  const dispatch = useDispatch();
  const { tagLists } = useSelector((state) => state.community);

  useEffect(() => {
    dispatch(requestGetAllTagLists());
  }, [dispatch]);

  return {
    tagLists
  };
};
