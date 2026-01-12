import { useNavigate } from "react-router-dom";

export const useDictionaryCard = ({link, disabled}) => {
  const navigate = useNavigate();

  const moveTo = (link) => {
    if (!disabled) navigate(link);
  };

  return {
    moveTo
  };
};
