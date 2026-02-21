import React from "react";
import { EVENT_TABLE } from "@/domains/events/config/eventTable.config.js";

const EventTableHead = () => {
  return (
    <tr>
      {EVENT_TABLE.map(col => (
        <th key={col.key}>{col.label}</th>
      ))}
    </tr>
  );
};

export default EventTableHead;
