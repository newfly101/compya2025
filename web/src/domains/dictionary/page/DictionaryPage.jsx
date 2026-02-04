import React from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { DICTIONARY_HOME_META } from "@/meta/pages/dictionary.meta.js";
import DictionaryViews from "@/domains/dictionary/feature/components/views/DictionaryViews.jsx";

const DictionaryPage = () => {
  const { pathname } = useLocation();

  const type = pathname.split("/").pop();
  const meta = DICTIONARY_HOME_META.contexts[type];

  // 미구현 NavigationCard 실수로 open 시 변경
  if (!meta) {
    return <Navigate to="/dictionary" replace />;
  }

  return <DictionaryViews />;
};

export default DictionaryPage;
