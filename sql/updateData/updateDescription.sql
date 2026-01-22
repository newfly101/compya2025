UPDATE player_skills
SET description = '범타 확률 증가, 스텟 증가'
WHERE target = 'PITCHER'  AND name = '베테랑';

UPDATE player_skills
SET description = '범타 확률 증가, 포심 회전 수 증가'
WHERE target = 'PITCHER'  AND name = '라이징패스트볼';

UPDATE player_skills
SET description = '주자가 많을수록 좋은 타구(장타, 홈런) 감소'
WHERE target = 'PITCHER'  AND name = '슈퍼스타';

UPDATE player_skills
SET description = '범타 확률 증가, 포심제외 변화량 증가'
WHERE target = 'PITCHER'  AND name = '팔색조';

UPDATE player_skills
SET description = '본인(중첩) 및 모든 투수 올스탯 증가'
WHERE target = 'PITCHER'  AND name = '캡틴';

UPDATE player_skills
SET description = '실점 후 스탯 증가, 첫 실점 후 노 아웃 상황 안타 감소'
WHERE target = 'PITCHER'  AND name = '각성';

UPDATE player_skills
SET description = '실점 전 스탯 증가'
WHERE target = 'PITCHER'  AND name = '버닝';

UPDATE player_skills
SET description = '아웃카운트당 스탯 증가, 2번재 이닝부터 첫 타자 안타 감소'
WHERE target = 'PITCHER'  AND name = '뒷심';

UPDATE player_skills
SET description = '자책 주자 있는 경우 스탯 증가(카리스마, 주루도사 무효화)'
WHERE target = 'PITCHER'  AND name = '결자해지';

UPDATE player_skills
SET description = '2스트라이크에서 삼진 확률 증가'
WHERE target = 'PITCHER'  AND name = '결정구';

UPDATE player_skills
SET description = '타자/주자 스탯 감소'
WHERE target = 'PITCHER'  AND name = '끝판왕';

UPDATE player_skills
SET description = '9회부터 동점/이기고 있는 경우 스탯 증가'
WHERE target = 'PITCHER'  AND name = '수호신';

UPDATE player_skills
SET description = '타자 타이밍을 빼앗음'
WHERE target = 'PITCHER'  AND name = '언터처블';

UPDATE player_skills
SET description = '스탯 증가 (3이닝 동안 능력치 스탯 추가 상승)'
WHERE target = 'PITCHER'  AND name = '에이스';

UPDATE player_skills
SET description = '선발 등판 시 체력 비례 범타 확률 증가'
WHERE target = 'PITCHER'  AND name = '이닝이터';

UPDATE player_skills
SET description = '타자보나 오버롤이 같거나 낮으면 안타 확률 감소'
WHERE target = 'PITCHER'  AND name = '자이언트킬러';

UPDATE player_skills
SET description = '출루 했던 타자 상대 시 범타 확률 증가'
WHERE target = 'PITCHER'  AND name = '투지';

UPDATE player_skills
SET description = '5점차 이상 지고 있는 경우 스탯 증가'
WHERE target = 'PITCHER'  AND name = '마당쇠';

UPDATE player_skills
SET description = '스탯(제구, 구위) 증가'
WHERE target = 'PITCHER'  AND name = '국보투수';

UPDATE player_skills
SET description = '등판 후 첫 이닝 스탯 증가'
WHERE target = 'PITCHER'  AND name = '셋업맨';

UPDATE player_skills
SET description = '4점 이상 이기고 있는 경우 스탯 증가'
WHERE target = 'PITCHER'  AND name = '승승장구';

UPDATE player_skills
SET description = '야수 스탯 증가'
WHERE target = 'PITCHER'  AND name = '야전지휘';

UPDATE player_skills
SET description = '첫 상대타자 한정 스탯 증가'
WHERE target = 'PITCHER'  AND name = '저격수';

UPDATE player_skills
SET description = '(중계) 체력 소모 증가, 나머지 스탯 증가'
WHERE target = 'PITCHER'  AND name = '전력투구';

UPDATE player_skills
SET description = '스탯(구위) 증가'
WHERE target = 'PITCHER'  AND name = '컨트롤아티스트';

UPDATE player_skills
SET description = '3,4,5번 타자 상대 시 스탯 증가'
WHERE target = 'PITCHER'  AND name = '클린업킬러';

UPDATE player_skills
SET description = '스탯(구위) 증가'
WHERE target = 'PITCHER'  AND name = '파워피쳐';
UPDATE player_skills
SET description = '스탯(직구, 변화) 증가'
WHERE target = 'PITCHER'  AND name = '피칭머신';
UPDATE player_skills
SET description = '4점 이상 지고 있을 시 스탯(제구,구위) 증가'
WHERE target = 'PITCHER'  AND name = '해결사';
UPDATE player_skills
SET description = '2아웃 이후 안타 확률 감소'
WHERE target = 'PITCHER'  AND name = '강심장';
UPDATE player_skills
SET description = '체력 소모 감소'
WHERE target = 'PITCHER'  AND name = '강철체력';
UPDATE player_skills
SET description = '견제사 확률 증가'
WHERE target = 'PITCHER'  AND name = '견제왕';
UPDATE player_skills
SET description = '스탯(직구) 증가'
WHERE target = 'PITCHER'  AND name = '광속투구';
UPDATE player_skills
SET description = '주자 3루 시 안타 확률 감소'
WHERE target = 'PITCHER'  AND name = '노련함';
UPDATE player_skills
SET description = '제구 서클 감소'
WHERE target = 'PITCHER'  AND name = '돌부처';
UPDATE player_skills
SET description = '스탯(변화) 증가'
WHERE target = 'PITCHER'  AND name = '마구연마';
UPDATE player_skills
SET description = '주자 도루 시도 감소'
WHERE target = 'PITCHER'  AND name = '얼음장';
UPDATE player_skills
SET description = '주자 없을 시 체력 소모 감소'
WHERE target = 'PITCHER'  AND name = '완급조절';
UPDATE player_skills
SET description = '우타 상대 시 안타 확률 감소'
WHERE target = 'PITCHER'  AND name = '우타킬러';
UPDATE player_skills
SET description = '주자 2루 이상 시 안타 확률 감소'
WHERE target = 'PITCHER'  AND name = '위기극복';
UPDATE player_skills
SET description = '좌타 상대 시 안타 확률 감소'
WHERE target = 'PITCHER'  AND name = '좌타킬러';
UPDATE player_skills
SET description = '주자 없는 경우 안타 확률 감소'
WHERE target = 'PITCHER'  AND name = '평정심';

UPDATE player_skills
SET description = '득점권 상황에서 삼진 및 장타 확률 증가'
WHERE target = 'PITCHER'  AND name = '승부사';


UPDATE player_skills
SET description = ''
WHERE target = 'HITTER'  AND name = '배테랑';
