import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CommunityList.module.scss";

const BoardTabs = ({boards, active}) => {
  const navigate = useNavigate();

  const handleNavigate = (uri) => {
    navigate(`?board=${uri}`)
  }

  return (
    <div className={styles.tabs}>
      {boards.map((board) => (
        <button
          key={board.code}
          className={`${styles.tab} ${
            board.code === active ? styles.active : ""
          }`}
          onClick={() => handleNavigate(board.code)}
        >
          {board.name}
        </button>
      ))}
    </div>
  );
};

export default BoardTabs;
