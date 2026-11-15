// 프로필 이미지 우선순위 — 직접 올린 이미지(profileImage) 가 없으면
// 네이버 로그인 때 받아온 이미지(oauthProfileImage) 를 대신 쓴다.
// 둘 다 없으면 undefined 를 돌려주고, Avatar 가 닉네임 첫 글자로 대체 표시한다.
// 화면마다 이 순서를 따로 정하면 어긋나므로 한 곳에 둔다.
export const pickProfileImageSrc = (user) => user?.profileImage || user?.oauthProfileImage || undefined;
