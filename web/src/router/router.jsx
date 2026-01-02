import { createBrowserRouter } from "react-router-dom";
import App from "@/App.jsx";
import Home from "@/pages/Home.jsx";
import Login from "@/pages/Login.jsx";
import Notice from "@/pages/Notice.jsx";
import FunNoticePage from "@/components/common/page/FunNoticePage.jsx";
import SkillChange from "@/pages/skillChange/SkillChange.jsx";
import TipPage from "@/pages/TipPage.jsx";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy.jsx";
import SkillDictionary from "@/components/common/page/SkillDictionary.jsx";
import Dictionary from "@/pages/dictionary/Dictionary.jsx";
import HitterSkillDictionary from "@/components/common/page/HitterSkillDictionary.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: {title: "컴프야펀 | 홈"}
      },
      {
        path: "login",
        element: <Login />,
      },
      {path: "notice", element: <Notice />},
      {path: "notice/:id", element: <FunNoticePage />},
      {path: "simulate", element: <SkillChange />, handle: { title: "컴프야펀 | 고스변 시뮬레이터" }},
      {path: "tips", element: <TipPage />, handle: { title: "컴프야펀 | 팁 모아보기" }},
      {path: "dictionary/pitcher", element: <SkillDictionary />, handle: { title: "컴프야펀 | 투수 스킬 백과사전" }},
      {path: "dictionary/batter", element: <HitterSkillDictionary />, handle: { title: "컴프야펀 | 타자 스킬 백과사전" }},
      {path: "dictionary", element: <Dictionary />, handle: { title: "컴프야펀 | 백과사전 홈" }},
      {path: "privacy", element: <PrivacyPolicy />, handle: { title: "컴프야펀 | 개인정보처리방침" }},
    ],
  },
]);

export default router;
