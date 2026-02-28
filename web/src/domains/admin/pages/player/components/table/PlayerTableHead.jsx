import React from "react";
import styles from "./PlayerTable.module.scss";
import { PLAYER_TABLE } from "@/domains/admin/pages/player/config/PlayerTableConfig.js";

const PlayerTableHead = () => {
  return (
    <tr>
      {PLAYER_TABLE.map(col => (
        <th key={col.key}>{col.label}</th>
      ))}
    </tr>
  );
};

export default PlayerTableHead;
