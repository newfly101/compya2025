// domains/players/config/position.js
// 포지션 표기 — 부포지션이 있으면 "주/부"(예: 1B/DH), 없으면 주포지션만.
// players(선수 백과사전)·mileage(마일리지 저격) 양쪽이 이 함수 하나만 쓴다.
// 화면마다 따로 만들면 표기가 어긋나므로 반드시 여기서만 만든다.
export function formatPosition(pos, subPos) {
  return subPos && subPos !== pos ? `${pos}/${subPos}` : pos;
}
