import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { DICTIONARY_PLAYER_CONFIG } from "@/domains/dictionary/feature/config/player/dictionaryPlayerConfig.js";
import PlayerDictionaryView from "@/domains/dictionary/feature/components/player/PlayerDictionaryView.jsx";
import CoachDictionaryView from "@/domains/dictionary/feature/components/coach/CoachDictionaryView.jsx";
import TeamDictionaryView from "@/domains/dictionary/feature/components/team/TeamDictionaryView.jsx";

const DICTIONARY_VALID_TYPES = ["home", "pitcher", "hitter", "coach", "team"];

const DictionaryPage = () => {
  const { pathname } = useLocation();

  const type = pathname.split("/").pop();

  // 미구현 NavigationCard 실수로 open 시 변경
  if (!DICTIONARY_VALID_TYPES.includes(type)) {
    return <Navigate to="/dictionary" replace />;
  }

  switch (type) {
    case "hitter":
    case "pitcher":
    {
      const config = DICTIONARY_PLAYER_CONFIG[type];
      if (!config) return <Navigate to="/dictionary" replace />;
      return <PlayerDictionaryView config={config} type={type}/>;
    }

    case "coach":
      return <CoachDictionaryView />;

    case "team":
      return <TeamDictionaryView />;

    default:
      return <Navigate to="/dictionary" replace />;
  }
};

export default DictionaryPage;
