import React from "react";
import styles from "./PlayerTable.module.scss";
import { PLAYER_TABLE } from "@/domains/playerCard/config/PlayerTableConfig.js";

const PlayerTableBody = ({cards, setEditCards}) => {
  if (cards.length === 0) {
    return (
      <tr>
        <td colSpan={PLAYER_TABLE.length} className={styles.empty}>
          등록된 선수가 없습니다.
        </td>
      </tr>
    );
  }

  return (
    <tbody>

    </tbody>
  );
};

export default PlayerTableBody;
