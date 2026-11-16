// 닉네임 미설정 판정 — 신규 가입자(빈 닉네임) 또는 소셜 이름이 가려진 닉네임(`***` 로 끝남).
// BE 가 nicknameSet 을 내려주면 그 값을 우선 믿고, 없는 응답(구버전)이면 닉네임으로 판정한다.
export const isNicknameUnset = (user) => {
  if (!user) return false;
  if (user.nicknameSet === false) return true;
  const nickname = String(user.nickname ?? "").trim();
  return nickname === "" || nickname.endsWith("***");
};
