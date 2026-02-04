import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { DICTIONARY_HOME_META } from "@/meta/pages/dictionary.meta.js";
import DictionaryViews from "@/domains/dictionary/feature/components/views/DictionaryViews.jsx";
import { DICTIONARY_PLAYER_CONFIG } from "@/domains/dictionary/feature/config/player/dictionaryPlayerConfig.js";

const DictionaryPage = () => {
  const { pathname } = useLocation();

  const type = pathname.split("/").pop();
  const meta = DICTIONARY_HOME_META.contexts[type];
  const config = DICTIONARY_PLAYER_CONFIG[type];

  // 미구현 NavigationCard 실수로 open 시 변경
  if (!meta || !config) {
    return <Navigate to="/dictionary" replace />;
  }

  return <DictionaryViews config={config} />;
};

export default DictionaryPage;
