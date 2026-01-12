import { useNavigate } from "react-router-dom";

export const useContentPageHeader = () => {
  const navigate = useNavigate();

  const handleMoveUrl = (url) => {
    navigate(url);
  };
  const moveHome = () => navigate("/");
  const moveTo = (url) => navigate(url);

  return {
    handleMoveUrl,
    moveHome,
    moveTo
  };
};
