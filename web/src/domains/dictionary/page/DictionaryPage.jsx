import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { DICTIONARY_HOME_META } from "@/meta/pages/dictionary.meta.js";
import { DICTIONARY_PLAYER_CONFIG } from "@/domains/dictionary/feature/config/player/dictionaryPlayerConfig.js";
import PlayerDictionaryView from "@/domains/dictionary/feature/components/player/PlayerDictionaryView.jsx";
import CoachDictionaryView from "@/domains/dictionary/feature/components/coach/CoachDictionaryView.jsx";
import TeamDictionaryView from "@/domains/dictionary/feature/components/team/TeamDictionaryView.jsx";

const DictionaryPage = () => {
  const { pathname } = useLocation();

  const type = pathname.split("/").pop();
  const meta = DICTIONARY_HOME_META.contexts[type];

  // 미구현 NavigationCard 실수로 open 시 변경
  if (!meta) {
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
