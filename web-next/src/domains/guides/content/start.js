// domains/guides/content/start.js
// 가이드 1편 — 처음 오셨다면, 컴프야펀 5분 사용법.
// 시드: 신규 작성. 근거는 domains/policy/mobile/AboutScreen.jsx(사이트 소개 문구),
// app/router/config/routePath.js(실제 라우트), app/wrapper/mobile/config/MENU_GROUPS.js·
// domains/home/config/QUICK_MENUS.js(로그인 게이트가 걸린 화면 확인), domains/users/mobile/MyPageScreen.jsx.

export const start = {
  slug: "start",
  title: "처음 오셨다면 — 컴프야펀 5분 사용법",
  seo: {
    title: "처음 오셨다면 — 컴프야펀 5분 사용법",
    description:
      "컴프야펀이 어떤 사이트인지, 로그인 없이 볼 수 있는 화면과 로그인하면 더 되는 것, 화면별 한 줄 요약을 5분 안에 정리했습니다.",
  },
  updatedAt: "2026-09-13",
  intro:
    "이 글은 컴프야펀에 처음 들어온 분을 위한 안내입니다. 사이트 어디에 뭐가 있는지 하나씩 눌러보며 찾을 필요 없이, " +
    "이 글 하나만 읽으면 전체 구조가 잡히도록 화면별로 짧게 정리했습니다. 더 깊은 사용법이 필요한 화면은 문단 " +
    "끝에 연결된 전용 가이드를 이어서 읽으면 됩니다.",
  sections: [
    {
      heading: "컴프야펀이 뭐 하는 곳인가",
      body: [
        {
          type: "p",
          text:
            "컴프야펀은 모바일 게임 '컴투스 프로야구' 시리즈를 즐기는 이용자를 위해 만들어진 비공식 팬 정보 사이트입니다. " +
            "게임 개발사·퍼블리셔가 운영하는 공식 사이트가 아니며, 어떠한 제휴·협력 관계도 없습니다. 쿠폰, 이벤트, " +
            "공지사항처럼 여기저기 흩어져 있는 정보를 한곳에 모으는 것이 1차 목적이고, 레전드 재료 평점표·히스토리 " +
            "재료 탐색기·마일리지 저격 경로처럼 게임에는 없는, 사이트가 직접 정리·분석한 데이터도 함께 제공합니다.",
        },
        {
          type: "note",
          text: "게임 내 상표·이미지·캐릭터 등에 대한 권리는 각 원저작자에게 있습니다. 정확한 최신 정보는 항상 게임 공식 채널로 다시 확인하는 것이 안전합니다.",
        },
      ],
    },
    {
      heading: "로그인 없이 볼 수 있는 것",
      body: [
        {
          type: "p",
          text: "회원가입이나 로그인 없이도 사이트 대부분의 화면을 그대로 열람할 수 있습니다. 화면별로 볼 수 있는 내용은 다음과 같습니다.",
        },
        {
          type: "table",
          headers: ["화면", "확인할 수 있는 것"],
          rows: [
            ["홈", "쿠폰·공지·이벤트 요약과 화면 전체로 이동하는 빠른 메뉴"],
            ["쿠폰", "최신 쿠폰과 종료된 쿠폰, 게임 내 등록 바로가기"],
            ["이벤트", "진행 중·종료된 이벤트와 원문(공식 카페 등) 링크"],
            ["공지사항", "사이트 자체 공지와 공식 카페 공지를 함께 열람"],
            ["레전드 재료 평점표", "레전드 카드별 필요 재료와 평점·능력치"],
            ["히스토리 재료 탐색기", "레전드 재료가 히스토리 모드 몇 라운드에서 나오는지"],
            ["마일리지 저격 경로", "마일리지 상점에서 바로 살 수 있는 레전드 재료 카드"],
            ["선수 백과사전", "구단·연도별 선수 카드 정보"],
            ["스킬 백과사전", "선수 스킬 등급표"],
            ["가이드(이 화면)", "지금 읽고 있는 것과 같은 사이트 활용법 모음"],
          ],
        },
      ],
    },
    {
      heading: "로그인하면 더 되는 것",
      body: [
        {
          type: "p",
          text:
            "컴프야펀은 로그인을 강제하지 않습니다. 다만 확률 공시 화면 하나만 로그인 후 이용할 수 있도록 되어 있고, " +
            "로그인하면 마이페이지에서 닉네임과 프로필 이미지를 바꾸거나 계정을 탈퇴하는 등 개인 설정을 관리할 수 " +
            "있습니다. 그 외 화면은 로그인 여부와 관계없이 동일하게 보입니다.",
        },
        {
          type: "ul",
          items: [
            "확률 공시 — 로그인 후 열람 가능 (홈 빠른 메뉴·드로어 메뉴에서 클릭 시 안내)",
            "마이페이지 — 닉네임·프로필 이미지 수정, 회원 탈퇴",
          ],
        },
      ],
    },
    {
      heading: "화면별 한 줄 요약",
      body: [
        {
          type: "p",
          text: "각 화면으로 바로 이동해 둘러볼 수 있습니다. 더 자세한 사용법은 아래 링크가 걸린 화면부터는 전용 가이드로 이어집니다.",
        },
        { type: "link", text: "홈 — 전체 요약이 모이는 시작 화면", href: "/", internal: true },
        { type: "link", text: "쿠폰 — 최신·종료 쿠폰 코드 모음", href: "/coupons", internal: true },
        { type: "link", text: "이벤트 — 진행 중·종료 이벤트 모음", href: "/events", internal: true },
        { type: "link", text: "공지사항 — 사이트 공지와 공식 카페 공지", href: "/notices", internal: true },
        { type: "link", text: "레전드 재료 평점표 — 자세한 사용법 가이드", href: "/guides/legend-stats-guide", internal: true },
        { type: "link", text: "히스토리 재료 탐색기 — 자세한 사용법 가이드", href: "/guides/history-legend-guide", internal: true },
        { type: "link", text: "마일리지 저격 경로 — 자세한 사용법 가이드", href: "/guides/mileage-sniping", internal: true },
        { type: "link", text: "선수 백과사전 — 자세한 사용법 가이드", href: "/guides/player-encyclopedia", internal: true },
        { type: "link", text: "스킬 백과사전 — 자세한 사용법 가이드", href: "/guides/player-skills-guide", internal: true },
        { type: "link", text: "확률 공시 — 어디를 봐야 하는지 안내", href: "/guides/probability-guide", internal: true },
        {
          type: "note",
          text: "화면을 눌러보다가 막히는 부분이 있으면 이 가이드 목록으로 돌아와 해당 화면 이름으로 찾으면 됩니다.",
        },
      ],
    },
  ],
};
