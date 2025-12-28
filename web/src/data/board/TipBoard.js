export const posts = (posts) => {
  return [...posts].sort((a, b) => {
    // 1순위: 게시일
    if (a.updatedAt !== b.updatedAt) {
      return b.updatedAt.localeCompare(a.updatedAt);
    }
    // 2순위: 작성일
    return b.writtenAt.localeCompare(a.writtenAt);
  });
};


export const postData = [
  {
    "id": 1,
    "title": "컴프야 뉴비를 위한 도움집 (1탄) (스압주의)",
    "author": "이마트",
    "writtenAt": "2023-03-05",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1591170"
  },
  {
    "id": 2,
    "title": "뉴비 팀선택 팁",
    "author": "Chabill",
    "writtenAt": "2023-04-05",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비","팀선택"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1602329"
  },
  {
    "id": 3,
    "title": "뉴비 리세가이드 (초보편)",
    "author": "Chabill",
    "writtenAt": "2023-04-06",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1602970"
  },
  {
    "id": 4,
    "title": "뉴비들을 위한 문답 모음",
    "author": "바프나프",
    "writtenAt": "2023-04-12",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1605695"
  },
  {
    "id": 5,
    "title": "뉴비 등반 팁",
    "author": "Chabill",
    "writtenAt": "2023-04-21",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1609624"
  },
  {
    "id": 6,
    "title": "컴프야 뉴비 팁 리뉴얼 1. 카드의 등급과 종류",
    "author": "바프나프",
    "writtenAt": "2023-05-04",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1616187"
  },
  {
    "id": 7,
    "title": "뉴비들이 꼭! 알아야되는 컴프야 덱짜는법,하드등반",
    "author": "허도환",
    "writtenAt": "2023-07-30",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1649556"
  },
  {
    "id": 8,
    "title": "뉴비가 느낀 하드등반 짧막 팁 (공격플)",
    "author": "아이뻐",
    "writtenAt": "2023-09-02",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1662719"
  },
  {
    "id": 12,
    "title": "뉴비가 작성하는 컴프야 뉴비 가이드(1) - 팀/연도 선택 법",
    "author": "공부해하는데",
    "writtenAt": "2024-08-22",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1782541"
  },
  {
    "id": 13,
    "title": "[고유능력] 사람들이 (뉴비~초보들) 아직도 오해 하는 사실",
    "author": "곽철이",
    "writtenAt": "2024-08-23",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1782736"
  },
  {
    "id": 22,
    "title": "뉴비를 위한 시그 스변요약",
    "author": "캅카스",
    "writtenAt": "2024-10-03",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1797580"
  },
  {
    "id": 23,
    "title": "뉴비가 작성하는 컴프야 뉴비 가이드(2) - 리세마라 (10-6 특별판)",
    "author": "쿠키컵케이크",
    "writtenAt": "2024-10-06",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1798636"
  },
  {
    "id": 31,
    "title": "오늘 시작한 뉴비 현질 순서",
    "author": "연뭉",
    "writtenAt": "2024-12-02",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1817642"
  },
  {
    "id": 33,
    "title": "뉴비를 위한 한화 연도 + 연시감 추천",
    "author": "불꽃남작",
    "writtenAt": "2025-02-24",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1839323"
  },
  {
    "id": 39,
    "title": "[뉴비 필독 1번] 안드로이드 에픽 리세 방법",
    "author": "원주윤도현",
    "writtenAt": "2025-07-07",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1890966"
  },
  {
    "id": 41,
    "title": "[뉴비 필독 2번] 스카우트 구장해제 빨리 하는 법",
    "author": "백호신",
    "writtenAt": "2025-07-20",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1894083"
  },
  {
    "id": 43,
    "title": "[뉴비 필독 3번] 게임 초반 단일연도(호환포함) 최대 14명 선수 수급하는 법",
    "author": "백호신",
    "writtenAt": "2025-08-03",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1897733"
  },
  {
    "id": 45,
    "title": "[뉴비 필독 4번] 멀티이닝 패널티",
    "author": "백호신",
    "writtenAt": "2025-09-13",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1910587"
  },
  {
    "id": 50,
    "title": "특별조합 뉴비분들을 위한 팁(가독성 떨어짐)",
    "author": "isfeize",
    "writtenAt": "2025-12-18",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1931849"
  },
  {
    "id": 53,
    "title": "뉴비분들을 위한 소소한 팁(?)",
    "author": "두산팬중 1명",
    "writtenAt": "2020-12-08",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1203168"
  },
  {
    "id": 55,
    "title": "뉴비들이 가장 강해지기 쉬운덱",
    "author": "leoking0402",
    "writtenAt": "2021-01-25",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1234358"
  },
  {
    "id": 56,
    "title": "뉴비들을 위한 컴프야 팁 (1)-리세, 카드 보는 법",
    "author": "린드블럼MVP",
    "writtenAt": "2021-02-03",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1240813"
  },
  {
    "id": 57,
    "title": "뉴비들을 위한 컴프야 팁 (2)-특수카드, 선수 강화,특훈,조합, 시너지, 한계돌파, 스카우트",
    "author": "린드블럼MVP",
    "writtenAt": "2021-02-04",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1241460"
  },
  {
    "id": 58,
    "title": "뉴비들을 위한 컴프야 총정리 1. 시작하기 전 알아야 할 것들",
    "author": "린드블럼MVP",
    "writtenAt": "2021-02-09",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1244740"
  },
  {
    "id": 60,
    "title": "뉴비들을 위한 컴프야 총정리 2. 컴프야의 다양한 모드들",
    "author": "린드블럼MVP",
    "writtenAt": "2021-02-23",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1253750"
  },
  {
    "id": 61,
    "title": "컴프야를 처음 시작하시는 뉴비분들을 위해 3: 해금덱이 잡덱, 팀덱보다 최강인 이유",
    "author": "LYDL",
    "writtenAt": "2021-03-13",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비","팀선택"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1264687"
  },
  {
    "id": 62,
    "title": "컴프야를 처음 시작하시는 뉴비들을 위해 4: 해금을 노리신다면 SSG, 엔씨, KT덱을 추천하는 이유(강요가 아닌 본인의 선택)",
    "author": "LYDL",
    "writtenAt": "2021-03-14",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1265326"
  },
  {
    "id": 63,
    "title": "컴프야 처음 시작하는 뉴비분들을 위해 6: 고유능력은 금색 스킬이 필수요소이며 설령 금색 스킬이어도 꼭 필요한 스킬과 있으나 없으나 상관없는 스킬, 필요없는 스킬에 대해(타자편)",
    "author": "LYDL",
    "writtenAt": "2021-03-15",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비","스킬"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1266043"
  },
  {
    "id": 64,
    "title": "컴프야 처음 시작하는 뉴비분들을 위해 5: 고유능력은 금색스킬이 필수요소이며 설령 금색 스킬이어도 꼭 필요한 스킬과 있으나 없으나 상관없는 스킬, 필요없는 스킬에 대해(투수편)",
    "author": "LYDL",
    "writtenAt": "2021-03-15",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비","스킬"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1266015"
  },
  {
    "id": 66,
    "title": "나온지 꽤 되었지만 듀얼에대해 모르는 뉴비를 위한글(장문임)",
    "author": "또삐또삐",
    "writtenAt": "2021-03-31",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1276824"
  },
  {
    "id": 70,
    "title": "초보자 뉴비 분들을 위한 질문, 팁 모음",
    "author": "바프나프",
    "writtenAt": "2021-04-22",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1292819"
  },
  {
    "id": 72,
    "title": "초보자 뉴비 분들을 위한 팁 3. 덱의 육성 방향",
    "author": "바프나프",
    "writtenAt": "2021-05-18",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1310844"
  },
  {
    "id": 75,
    "title": "초보자 뉴비 분들을 위한 팁 0~3 중간정리",
    "author": "바프나프",
    "writtenAt": "2021-05-27",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1315997"
  },
  {
    "id": 76,
    "title": "(스압) 초보자 뉴비 분들을 위한 팁 4. 리그모드, 하드모드",
    "author": "바프나프",
    "writtenAt": "2021-05-28",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1316607"
  },
  {
    "id": 77,
    "title": "클럽 대전에 대한 이해 (for 뉴비)",
    "author": "고운음",
    "writtenAt": "2021-06-24",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1330625"
  },
  {
    "id": 79,
    "title": "(스압) 초보자 뉴비 분들을 위한 팁 5-1. 고유능력(스킬) 기본편",
    "author": "바프나프",
    "writtenAt": "2021-07-09",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드","스킬"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1340033"
  },
  {
    "id": 80,
    "title": "(스압) 초보자 뉴비 분들을 위한 팁 5-1. 고유능력(스킬) 기본편",
    "author": "로그비",
    "writtenAt": "2021-07-11",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비","스킬"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1340934"
  },
  {
    "id": 81,
    "title": "(스압) 초보자 뉴비 분들을 위한 팁 6. 팀별 좋은 연도 (팀-연도별 시그)",
    "author": "바프나프",
    "writtenAt": "2021-07-12",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드","팀선택"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1342328"
  },
  {
    "id": 82,
    "title": "초보자 뉴비 분들을 위한 질문 모음 2",
    "author": "바프나프",
    "writtenAt": "2021-07-20",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1349119"
  },
  {
    "id": 85,
    "title": "(스압) 초보자 뉴비 분들을 위한 팁 7. 클럽 (完)",
    "author": "바프나프",
    "writtenAt": "2021-08-24",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1373719"
  },
  {
    "id": 86,
    "title": "뉴비를 위한 구단육성 가이드",
    "author": "높새타이거즈",
    "writtenAt": "2021-09-10",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1384664"
  },
  {
    "id": 87,
    "title": "뉴비들을 위한 가이드미션 팁",
    "author": "바프나프",
    "writtenAt": "2022-01-13",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1439762"
  },
  {
    "id": 88,
    "title": "[뉴비/초보] 레민철(aka 모두의 민철)에 관하여...",
    "author": "슼와이번 18sk",
    "writtenAt": "2022-01-25",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1444001"
  },
  {
    "id": 90,
    "title": "새 시즌을 맞은 뉴비 간단 팁 - 승부예측 3종",
    "author": "바프나프2",
    "writtenAt": "2022-03-21",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1466047"
  },
  {
    "id": 91,
    "title": "뉴비를 위한 가이드미션 주간미션 달성하기 팁",
    "author": "v199kt",
    "writtenAt": "2022-03-31",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1469349"
  },
  {
    "id": 92,
    "title": "[#하드모드 / #뉴비] 11,000 전력 하드모드 등반 팁",
    "author": "LG윗이",
    "writtenAt": "2022-06-20",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1500686"
  },
  {
    "id": 96,
    "title": "뉴비들을 위한 컴프야 가이드",
    "author": "인천 SSG",
    "writtenAt": "2022-12-29",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1569601"
  },
  {
    "id": 97,
    "title": "컴프야 뉴비를 위한 도움집 (1탄) (스압주의) (수정 4.17)",
    "author": "아이u",
    "writtenAt": "2023-02-02",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1579304"
  },
  {
    "id": 98,
    "title": "뉴비가 먼저 해야 하는 것들",
    "author": "바프나프",
    "writtenAt": "2023-02-04",
    "updatedAt": "2025-12-29",
    "tags": ["바프나프","뉴비가이드"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1579928"
  },
  {
    "id": 99,
    "title": "컴프야 뉴비를 위한 도움집 (2탄) (스압주의)",
    "author": "아이u",
    "writtenAt": "2023-02-10",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1582013"
  },
  {
    "id": 100,
    "title": "컴프야 뉴비를 위한 도움집 (3탄) (스압주의)",
    "author": "아이u",
    "writtenAt": "2023-02-21",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1586638"
  },
  {
    "id": 106,
    "title": "[뉴비/초보] 팀 관리 팁(1-1 타자 스킬 편) => 2020.3.26. 수정판",
    "author": "슼와이번 8th",
    "writtenAt": "2018-09-01",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비","스킬","팀선택"],
    "url": "https://cafe.naver.com/com2usbaseball2015/726428"
  },
  {
    "id": 107,
    "title": "[뉴비/초보] 팀 관리 팁(1-2 투수 스킬 편) ㅡ 20. 09. 04 수정판",
    "author": "슼와이번 8th",
    "writtenAt": "2018-09-22",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비","스킬","팀선택"],
    "url": "https://cafe.naver.com/com2usbaseball2015/741208"
  },
  {
    "id": 110,
    "title": "[뉴비/초보] 팀 관리 팁 (2. 조합 편)",
    "author": "슼와이번 8th",
    "writtenAt": "2019-01-18",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비","팀선택"],
    "url": "https://cafe.naver.com/com2usbaseball2015/797059"
  },
  {
    "id": 115,
    "title": "[뉴비/초보] 팀 관리 팁(1-1 타자 스킬 편) 업데이트 안내",
    "author": "슼와이번 8th",
    "writtenAt": "2020-02-25",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비","스킬"],
    "url": "https://cafe.naver.com/com2usbaseball2015/988257"
  },
  {
    "id": 116,
    "title": "[뉴비/초보] 팀 관리 팁(1-2 투수 스킬 편) 업데이트 안내",
    "author": "슼와이번 18sk",
    "writtenAt": "2020-03-13",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비","스킬"],
    "url": "https://cafe.naver.com/com2usbaseball2015/997975"
  },
  {
    "id": 120,
    "title": "컴프야 새로 하시는 뉴비분들 필독",
    "author": "SAKURAKO",
    "writtenAt": "2020-06-27",
    "updatedAt": "2025-12-29",
    "tags": ["뉴비"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1084302"
  },
  {
    "id": 121,
    "title": "[뉴비/초보] 팀 관리 팁 몰아보기 / 구단명: SK와이번8th",
    "author": "슼와이번 18sk",
    "writtenAt": "2020-06-27",
    "updatedAt": "2025-12-29",
    "tags": ["스킬"],
    "url": "https://cafe.naver.com/com2usbaseball2015/1083876"
  },
]
