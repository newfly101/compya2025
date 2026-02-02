import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const usePosts = () => {
  const dispatch = useDispatch();
  const { postLists } = useSelector((state) => state.community);

  useEffect(() => {
    dispatch(requestGetAllPostLists());
  }, [dispatch]);

  return {
    postLists
  };
};
