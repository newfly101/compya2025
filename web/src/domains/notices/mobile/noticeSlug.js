// 공지 제목 → 주소조각(slug) 변환. 서버는 id 로만 조회하고, 주소 표시에만 이 값을 쓴다.
// 주의: 제목 → slug 는 단방향이다(역변환 불가). 조회는 목록을 훑어 title 을 다시 slugify 해서 대조한다.
export const noticeTitleToSlug = (title, id) => {
  const cleaned = (title ?? "")
    .trim()
    .toLowerCase()
    // 한글·영문·숫자만 남기고 나머지는 "-" 로 치환
    .replace(/[^0-9a-z가-힣]+/g, "-")
    // 연속된 "-" 를 하나로 접고 앞뒤 "-" 제거
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    // 최대 180자. 자르는 과정에서 끝에 "-" 가 남을 수 있어 한 번 더 제거
    .slice(0, 180)
    .replace(/-+$/g, "");

  return cleaned || `notice-${id}`;
};
