import pitcherImg from "@/assets/dictionary/pitcherImg.png";
import hitterImg from "@/assets/dictionary/hitterImg.png";
import coachImg from "@/assets/dictionary/coachImg.png";
import logoImg from "@/assets/dictionary/logoImg.png";

export const DICTIONARY_HOME_CARDS = [
  {
    key: "pitcher",
    icon: "🧤",
    title: "투수 스킬 백과사전",
    description: [
      "레전드 투수 스킬 조합",
      "플래티넘 투수 스킬 조합",
      "선발/중계/마무리 조합",
    ],
    link: "/dictionary/pitcher",
    image: pitcherImg,
    disabled: false,
  },
  {
    key: "hitter",
    icon: "⚾",
    title: "타자 스킬 백과사전",
    description: [
      "레전드 타자 스킬 조합",
      "플레티넘 타자 스킬 조합",
      "포지션 별 추천 조합",
    ],
    link: "/dictionary/hitter",
    image: hitterImg,
    disabled: false,
  },
  {
    key: "coach",
    icon: "🧠",
    title: "코치 스킬 백과사전",
    description: [
      "코치 스킬 메타 추천",
      "코치 스킬별 설명",
      "마스터 코치 추천 스킬",
    ],
    link: "/dictionary/coach",
    image: coachImg,
    disabled: true,
  },
  {
    key: "team",
    icon: "🧠",
    title: "구단 선수 백과사전",
    description: [
      "구단별 선수 백과사전",
      "추천 시그니처 백과사전",
    ],
    link: "/dictionary/team",
    image: logoImg,
    disabled: true,
  },
]
