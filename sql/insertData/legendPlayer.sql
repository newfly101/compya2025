INSERT INTO player_legend
(card_code, name, team_id, role, overall, back_number, birth_date, bat_throw, positions, traits, attributes)
VALUES
    (
        'LEGEND_HITTER_SAM_LEE_MANSOO',
        '이만수',
        (SELECT id FROM teams WHERE team_code = 'SAM'),
        'HITTER',
        85,
        22,
        '1958-09-19',
        '우투/우타',
        JSON_ARRAY('C'),
        JSON_ARRAY('특이폼', '페이스'),
        JSON_OBJECT(
                'accuracy', 88,
                'power', 89,
                'contact', 87,
                'speed', 79,
                'defense', 83
        )
    ),
    (
        'LEGEND_HITTER_DOO_HONG_SEONGHEUN',
        '홍성흔',
        (SELECT id FROM teams WHERE team_code = 'DOO'),
        'HITTER',
        85,
        22,
        '1977-02-28',
        '우투/우타',
        JSON_ARRAY('C','DH'),
        JSON_ARRAY('특이폼', '페이스'),
        JSON_OBJECT(
                'accuracy', 87,
                'power', 82,
                'contact', 85,
                'speed', 82,
                'defense', 92
        )
    ),
    (
        'LEGEND_HITTER_LOT_KANG_MINHO',
        '강민호',
        (SELECT id FROM teams WHERE team_code = 'LOT'),
        'HITTER',
        85,
        47,
        '1985-08-18',
        '우투/우타',
        JSON_ARRAY('C'),
        JSON_ARRAY('특이폼', '페이스'),
        JSON_OBJECT(
                'accuracy', 86,
                'power', 91,
                'contact', 85,
                'speed', 77,
                'defense', 89
        )
    ),
    (
        'LEGEND_HITTER_NC_YANG_UIJI',
        '양의지',
        (SELECT id FROM teams WHERE team_code = 'NC'),
        'HITTER',
        87,
        25,
        '1987-06-05',
        '우투/우타',
        JSON_ARRAY('C'),
        JSON_ARRAY('특이폼', '페이스'),
        JSON_OBJECT(
                'accuracy', 87,
                'power', 88,
                'contact', 88,
                'speed', 80,
                'defense', 92
        )
    ),
    (
        'LEGEND_HITTER_HAE_JANG_SEONGHO',
        '장성호',
        (SELECT id FROM teams WHERE team_code = 'HAE'),
        'HITTER',
        87,
        1,
        '1977-10-18',
        '좌투/좌타',
        JSON_ARRAY('1B','RF'),
        JSON_ARRAY('특이폼', '페이스'),
        JSON_OBJECT(
                'accuracy', 89,
                'power', 86,
                'contact', 89,
                'speed', 82,
                'defense', 92
        )
    ),
    (
        'LEGEND_HITTER_NC_LEE_HOJUN_B',
        '이호준B',
        (SELECT id FROM teams WHERE team_code = 'NC'),
        'HITTER',
        85,
        27,
        '1976-02-08',
        '우투/우타',
        JSON_ARRAY('1B'),
        JSON_ARRAY('특이폼', '페이스'),
        JSON_OBJECT(
                'accuracy', 83,
                'power', 88,
                'contact', 86,
                'speed', 83,
                'defense', 89
        )
    ),
    (
        'LEGEND_HITTER_SAM_LEE_SEUNGYEOP',
        '이승엽',
        (SELECT id FROM teams WHERE team_code = 'SAM'),
        'HITTER',
        88,
        36,
        '1976-08-18',
        '좌투/좌타',
        JSON_ARRAY('1B'),
        JSON_ARRAY('특이폼', '페이스'),
        JSON_OBJECT(
                'accuracy', 86,
                'power', 95,
                'contact', 90,
                'speed', 83,
                'defense', 87
        )
    ),
    (
        'LEGEND_HITTER_LOT_MA_HAEYOUNG',
        '마해영',
        (SELECT id FROM teams WHERE team_code = 'LOT'),
        'HITTER',
        88,
        49,
        '1970-08-14',
        '우투/우타',
        JSON_ARRAY('1B'),
        JSON_ARRAY('특이폼','페이스'),
        JSON_OBJECT(
                'accuracy', 92,
                'power', 90,
                'contact', 90,
                'speed', 82,
                'defense', 87
        )
    ),
    (
        'LEGEND_HITTER_SSA_KIM_KITAE_S',
        '김기태S',
        (SELECT id FROM teams WHERE team_code = 'SSA'),
        'HITTER',
        87,
        10,
        '1969-05-23',
        '좌투/좌타',
        JSON_ARRAY('1B','DH'),
        JSON_ARRAY('특이폼','페이스'),
        JSON_OBJECT(
                'accuracy', 89,
                'power', 89,
                'contact', 92,
                'speed', 82,
                'defense', 83
        )
    ),
    (
        'LEGEND_HITTER_HAN_JANG_JONGHOON',
        '장종훈',
        (SELECT id FROM teams WHERE team_code = 'HAN'),
        'HITTER',
        88,
        35,
        '1968-04-10',
        '우투/우타',
        JSON_ARRAY('1B','SS'),
        JSON_ARRAY('특이폼','페이스'),
        JSON_OBJECT(
                'accuracy', 89,
                'power', 89,
                'contact', 89,
                'speed', 86,
                'defense', 87
        )
    ),
    (
        'LEGEND_HITTER_HAN_KIM_TAEKYUN',
        '김태균',
        (SELECT id FROM teams WHERE team_code = 'HAN'),
        'HITTER',
        86,
        52,
        '1982-05-29',
        '우투/우타',
        JSON_ARRAY('1B'),
        JSON_ARRAY('특이폼','페이스'),
        JSON_OBJECT(
                'accuracy', 91,
                'power', 85,
                'contact', 92,
                'speed', 74,
                'defense', 90
        )
    ),
    (
        'LEGEND_HITTER_HAE_KIM_SUNGHAN',
        '김성한',
        (SELECT id FROM teams WHERE team_code = 'HAE'),
        'HITTER',
        84,
        11,
        '1958-05-18',
        '우투/우타',
        '["1B"]',
        '["특이폼","페이스"]',
        '{"accuracy":88,"power":86,"contact":88,"speed":79,"defense":81}'
    ),
    (
        'LEGEND_HITTER_OB_UZZ',
        '우즈',
        (SELECT id FROM teams WHERE team_code = 'OB'),
        'HITTER',
        83,
        33,
        '1969-08-19',
        '우투/우타',
        '["1B"]',
        '["특이폼","페이스"]',
        '{"accuracy":85,"power":90,"contact":84,"speed":74,"defense":86}'
    ),

    (
        'LEGEND_HITTER_KIW_PARK_BYUNGHO',
        '박병호',
        (SELECT id FROM teams WHERE team_code = 'KIW'),
        'HITTER',
        86,
        52,
        '1986-07-10',
        '우투/우타',
        '["1B"]',
        '["특이폼","페이스"]',
        '{"accuracy":89,"power":93,"contact":86,"speed":79,"defense":87}'
    ),

    (
        'LEGEND_HITTER_LOT_PARK_JUNGTAE',
        '박정태',
        (SELECT id FROM teams WHERE team_code = 'LOT'),
        'HITTER',
        87,
        16,
        '1969-01-27',
        '우투/우타',
        '["2B"]',
        '["특이폼","페이스"]',
        '{"accuracy":88,"power":84,"contact":90,"speed":84,"defense":91}'
    ),

    (
        'LEGEND_HITTER_LOT_3B_LEE_DAEHO',
        '이대호',
        (SELECT id FROM teams WHERE team_code = 'LOT'),
        'HITTER',
        88,
        10,
        '1982-06-21',
        '우투/우타',
        '["1B","3B"]',
        '["특이폼","페이스"]',
        '{"accuracy":94,"power":94,"contact":92,"speed":74,"defense":89}'
    ),

    (
        'LEGEND_HITTER_SK_JUNG_GEUNWOO',
        '정근우',
        (SELECT id FROM teams WHERE team_code = 'SK'),
        'HITTER',
        87,
        8,
        '1982-10-02',
        '우투/우타',
        '["2B"]',
        '["특이폼","페이스"]',
        '{"accuracy":88,"power":80,"contact":89,"speed":91,"defense":88}'
    ),

    (
        'LEGEND_HITTER_DOO_KIM_DONGJOO',
        '김동주B',
        (SELECT id FROM teams WHERE team_code = 'DOO'),
        'HITTER',
        84,
        18,
        '1976-02-03',
        '우투/우타',
        '["3B"]',
        '["특이폼","페이스"]',
        '{"accuracy":88,"power":88,"contact":88,"speed":74,"defense":84}'
    ),

    (
        'LEGEND_HITTER_HAE_HAN_DAEHWA',
        '한대화',
        (SELECT id FROM teams WHERE team_code = 'HAE'),
        'HITTER',
        85,
        8,
        '1960-07-08',
        '우투/우타',
        '["3B"]',
        '["특이폼","페이스"]',
        '{"accuracy":88,"power":83,"contact":91,"speed":81,"defense":82}'
    ),

    (
        'LEGEND_HITTER_HAE_CF_LEE_JONGBUM',
        '이종범',
        (SELECT id FROM teams WHERE team_code = 'HAE'),
        'HITTER',
        92,
        7,
        '1970-08-15',
        '우투/우타',
        '["SS","CF"]',
        '["특이폼","페이스"]',
        '{"accuracy":94,"power":85,"contact":92,"speed":101,"defense":88}'
    ),

    (
        'LEGEND_HITTER_SK_CHOIJUNG',
        '최정',
        (SELECT id FROM teams WHERE team_code = 'SK'),
        'HITTER',
        86,
        14,
        '1987-02-28',
        '우투/우타',
        '["3B"]',
        '["특이폼","페이스"]',
        '{"accuracy":86,"power":93,"contact":86,"speed":79,"defense":88}'
    ),

    (
        'LEGEND_HITTER_KIA_LEEBEOMHO',
        '이범호',
        (SELECT id FROM teams WHERE team_code = 'KIA'),
        'HITTER',
        85,
        25,
        '1981-11-25',
        '우투/우타',
        '["3B"]',
        '["특이폼","페이스"]',
        '{"accuracy":85,"power":87,"contact":87,"speed":77,"defense":89}'
    ),

    (
        'LEGEND_HITTER_SAM_RYU_JUNGIL',
        '류중일',
        (SELECT id FROM teams WHERE team_code = 'SAM'),
        'HITTER',
        86,
        1,
        '1963-04-28',
        '우투/우타',
        '["SS"]',
        '["특이폼","페이스"]',
        '{"accuracy":86,"power":80,"contact":87,"speed":89,"defense":92}'
    ),

    (
        'LEGEND_HITTER_HYU_PARKJINMAN',
        '박진만',
        (SELECT id FROM teams WHERE team_code = 'HYU'),
        'HITTER',
        85,
        7,
        '1976-11-30',
        '우투/우타',
        '["SS"]',
        '["특이폼","페이스"]',
        '{"accuracy":84,"power":85,"contact":85,"speed":83,"defense":88}'
    ),

    (
        'LEGEND_HITTER_MBC_KIMJAEPARK',
        '김재박',
        (SELECT id FROM teams WHERE team_code = 'MBC'),
        'HITTER',
        86,
        7,
        '1954-05-23',
        '우투/우타',
        '["SS"]',
        '["특이폼","페이스"]',
        '{"accuracy":86,"power":78,"contact":87,"speed":92,"defense":88}'
    ),

    (
        'LEGEND_HITTER_SAM_JANGHYOJO',
        '장효조',
        (SELECT id FROM teams WHERE team_code = 'SAM'),
        'HITTER',
        87,
        10,
        '1956-07-06',
        '좌투/좌타',
        '["LF"]',
        '["특이폼","페이스"]',
        '{"accuracy":91,"power":87,"contact":92,"speed":83,"defense":83}'
    ),

    (
        'LEGEND_HITTER_LG_PARKYONGTAEK',
        '박용택',
        (SELECT id FROM teams WHERE team_code = 'LG'),
        'HITTER',
        85,
        33,
        '1979-04-21',
        '우투/좌타',
        '["LF"]',
        '["특이폼","페이스"]',
        '{"accuracy":90,"power":84,"contact":86,"speed":81,"defense":84}'
    ),

    (
        'LEGEND_HITTER_MBC_BAEKINCHUN',
        '백인천',
        (SELECT id FROM teams WHERE team_code = 'MBC'),
        'HITTER',
        87,
        2,
        '1943-11-27',
        '우투/우타',
        '["LF"]',
        '["특이폼","페이스"]',
        '{"accuracy":95,"power":91,"contact":94,"speed":80,"defense":79}'
    ),

    (
        'LEGEND_HITTER_LG_LEEBYUNGKYU_B',
        '이병규B',
        (SELECT id FROM teams WHERE team_code = 'LG'),
        'HITTER',
        89,
        9,
        '1974-10-25',
        '좌투/좌타',
        '["CF"]',
        '["특이폼","페이스"]',
        '{"accuracy":89,"power":88,"contact":86,"speed":90,"defense":92}'
    ),

    (
        'LEGEND_HITTER_SAM_CHOIHYUNGWOO',
        '최형우',
        (SELECT id FROM teams WHERE team_code = 'SAM'),
        'HITTER',
        87,
        34,
        '1983-12-16',
        '우투/좌타',
        '["LF"]',
        '["특이폼","페이스"]',
        '{"accuracy":92,"power":89,"contact":91,"speed":74,"defense":92}'
    ),

    (
        'LEGEND_HITTER_DOO_KIM_HYUNSOO',
        '김현수B',
        (SELECT id FROM teams WHERE team_code = 'DOO'),
        'HITTER',
        87,
        50,
        '1988-01-12',
        '우투/좌타',
        '["LF"]',
        '["특이폼","페이스"]',
        '{"accuracy":89,"power":85,"contact":91,"speed":80,"defense":90}'
    ),

    (
        'LEGEND_HITTER_HYU_PARK_JAEHONG',
        '박재홍',
        (SELECT id FROM teams WHERE team_code = 'HYU'),
        'HITTER',
        87,
        62,
        '1973-09-07',
        '우투/우타',
        '["CF"]',
        '["특이폼","페이스"]',
        '{"accuracy":85,"power":88,"contact":86,"speed":87,"defense":92}'
    ),

    (
        'LEGEND_HITTER_LOT_JEON_JUNHO',
        '전준호',
        (SELECT id FROM teams WHERE team_code = 'LOT'),
        'HITTER',
        87,
        1,
        '1969-02-15',
        '좌투/좌타',
        '["CF"]',
        '["특이폼","페이스"]',
        '{"accuracy":85,"power":77,"contact":88,"speed":99,"defense":90}'
    ),

    (
        'LEGEND_HITTER_HYU_SHIM_JUNGSU',
        '심정수',
        (SELECT id FROM teams WHERE team_code = 'HYU'),
        'HITTER',
        89,
        32,
        '1975-05-05',
        '우투/우타',
        '["RF"]',
        '["특이폼","페이스"]',
        '{"accuracy":88,"power":95,"contact":95,"speed":78,"defense":92}'
    ),

    (
        'LEGEND_HITTER_SAM_1B_YANG_JUNHYUK',
        '양준혁',
        (SELECT id FROM teams WHERE team_code = 'SAM'),
        'HITTER',
        89,
        10,
        '1969-05-26',
        '좌투/좌타',
        '["RF","1B"]',
        '["특이폼","페이스"]',
        '{"accuracy":89,"power":88,"contact":91,"speed":88,"defense":92}'
    ),

    (
        'LEGEND_HITTER_HAE_LEE_SOONCHUL',
        '이순철',
        (SELECT id FROM teams WHERE team_code = 'HAE'),
        'HITTER',
        87,
        14,
        '1961-04-18',
        '우투/우타',
        '["CF"]',
        '["특이폼","페이스"]',
        '{"accuracy":85,"power":83,"contact":87,"speed":92,"defense":89}'
    ),

    (
        'LEGEND_HITTER_LOT_SON_ASEOP',
        '손아섭',
        (SELECT id FROM teams WHERE team_code = 'LOT'),
        'HITTER',
        87,
        31,
        '1988-03-18',
        '우투/좌타',
        '["RF"]',
        '["특이폼","페이스"]',
        '{"accuracy":91,"power":84,"contact":91,"speed":81,"defense":90}'
    ),

    (
        'LEGEND_HITTER_SAM_PARK_HANI',
        '박한이',
        (SELECT id FROM teams WHERE team_code = 'SAM'),
        'HITTER',
        85,
        33,
        '1979-01-28',
        '좌투/좌타',
        '["RF"]',
        '["특이폼","페이스"]',
        '{"accuracy":86,"power":80,"contact":88,"speed":83,"defense":92}'
    ),

    (
        'LEGEND_HITTER_LG_KIM_JAEHYUN',
        '김재현',
        (SELECT id FROM teams WHERE team_code = 'LG'),
        'HITTER',
        84,
        7,
        '1975-10-02',
        '좌투/좌타',
        '["RF"]',
        '["특이폼","페이스"]',
        '{"accuracy":83,"power":83,"contact":84,"speed":84,"defense":90}'
    ),

    (
        'LEGEND_HITTER_SK_PARK_KYUNGWAN',
        '박경완',
        (SELECT id FROM teams WHERE team_code = 'SK'),
        'HITTER',
        86,
        26,
        '1972-07-11',
        '우투/우타',
        '["C"]',
        '["특이폼","페이스"]',
        '{"accuracy":83,"power":89,"contact":87,"speed":80,"defense":92}'
    );

INSERT INTO player_legend
(card_code, name, team_id, role, overall, back_number, birth_date, bat_throw, positions, traits, attributes)
VALUES
    (
        'LEGEND_PITCHER_HAE_LEGEND_SUNDONGYEOL',
        '선동열',
        (SELECT id FROM teams WHERE team_code = 'HAE'),
        'PITCHER',
        90,
        18,
        '1963-01-10',
        '우투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":95,"control":92,"stamina":89,"breaking":89,"movement":89}'
    ),
    (
        'LEGEND_PITCHER_HAN_LEGEND_JUNGMINCHEOL',
        '정민철',
        (SELECT id FROM teams WHERE team_code = 'HAN'),
        'PITCHER',
        88,
        23,
        '1972-03-28',
        '우투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":84,"control":86,"stamina":93,"breaking":87,"movement":90}'
    ),
    (
        'LEGEND_PITCHER_LOT_LEGEND_CHOEDONGWON',
        '최동원',
        (SELECT id FROM teams WHERE team_code = 'LOT'),
        'PITCHER',
        88,
        11,
        '1958-05-24',
        '우투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":92,"control":84,"stamina":86,"breaking":91,"movement":89}'
    ),
    (
        'LEGEND_PITCHER_HYU_LEGEND_JUNGMINTAE',
        '정민태',
        (SELECT id FROM teams WHERE team_code = 'HYU'),
        'PITCHER',
        88,
        20,
        '1970-03-01',
        '우투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":89,"control":83,"stamina":90,"breaking":90,"movement":88}'
    ),
    (
        'LEGEND_PITCHER_OB_LEGEND_PARKCHEOLSOON',
        '박철순',
        (SELECT id FROM teams WHERE team_code = 'OB'),
        'PITCHER',
        87,
        21,
        '1956-03-12',
        '우투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":88,"control":83,"stamina":88,"breaking":91,"movement":88}'
    ),
    (
        'LEGEND_PITCHER_LOT_LEGEND_YOONHAKGIL',
        '윤학길',
        (SELECT id FROM teams WHERE team_code = 'LOT'),
        'PITCHER',
        85,
        29,
        '1961-07-04',
        '우투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":83,"control":78,"stamina":89,"breaking":88,"movement":87}'
    ),
    (
        'LEGEND_PITCHER_SAM_LEGEND_KIMSIGIN',
        '김시진',
        (SELECT id FROM teams WHERE team_code = 'SAM'),
        'PITCHER',
        87,
        29,
        '1958-03-20',
        '우투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":89,"control":86,"stamina":86,"breaking":92,"movement":86}'
    ),
    (
        'LEGEND_PITCHER_LG_LEGEND_LEESANGHOON_C',
        '이상훈C',
        (SELECT id FROM teams WHERE team_code = 'LG'),
        'PITCHER',
        89,
        47,
        '1971-03-11',
        '좌투/좌타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":89,"control":85,"stamina":92,"breaking":90,"movement":89}'
    ),
    (
        'LEGEND_PITCHER_HAN_LEGEND_SONGJINWOO',
        '송진우',
        (SELECT id FROM teams WHERE team_code = 'HAN'),
        'PITCHER',
        87,
        21,
        '1966-02-16',
        '좌투/좌타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":83,"control":87,"stamina":91,"breaking":87,"movement":87}'
    ),
    (
        'LEGEND_PITCHER_HAE_LEGEND_LEEKANGCHEOL',
        '이강철',
        (SELECT id FROM teams WHERE team_code = 'HAE'),
        'PITCHER',
        86,
        19,
        '1966-05-24',
        '우투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":88,"control":82,"stamina":89,"breaking":89,"movement":86}'
    ),
    (
        'LEGEND_PITCHER_HAE_LEGEND_JOKYEHYUN',
        '조계현',
        (SELECT id FROM teams WHERE team_code = 'HAE'),
        'PITCHER',
        87,
        17,
        '1964-05-01',
        '우투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":88,"control":83,"stamina":93,"breaking":86,"movement":87}'
    ),
    (
        'LEGEND_PITCHER_DOO_LEGEND_NIPPERT',
        '니퍼트',
        (SELECT id FROM teams WHERE team_code = 'DOO'),
        'PITCHER',
        86,
        40,
        '1981-05-06',
        '우투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":86,"control":83,"stamina":87,"breaking":87,"movement":89}'
    ),
    (
        'LEGEND_PITCHER_SAM_LEGEND_BAEYOUNGSU',
        '배영수',
        (SELECT id FROM teams WHERE team_code = 'SAM'),
        'PITCHER',
        87,
        25,
        '1981-05-04',
        '우투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":86,"control":83,"stamina":86,"breaking":93,"movement":88}'
    ),
    (
        'LEGEND_PITCHER_SSA_LEGEND_KIMWONHYUNG',
        '김원형',
        (SELECT id FROM teams WHERE team_code = 'SSA'),
        'PITCHER',
        84,
        48,
        '1972-07-05',
        '우투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":88,"control":83,"stamina":88,"breaking":80,"movement":84}'
    ),
    (
        'LEGEND_PITCHER_HAN_LIVING_LEGEND_RYUHJ',
        '류현진',
        (SELECT id FROM teams WHERE team_code = 'HAN'),
        'PITCHER',
        87,
        99,
        '1987-03-25',
        '좌투/우타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":90,"control":87,"stamina":92,"breaking":83,"movement":86}'
    ),
    (
        'LEGEND_PITCHER_SK_LIVING_LEGEND_KIMGH',
        '김광현',
        (SELECT id FROM teams WHERE team_code = 'SK'),
        'PITCHER',
        85,
        29,
        '1988-07-22',
        '좌투/좌타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":86,"control":86,"stamina":88,"breaking":86,"movement":83}'
    ),
    (
        'LEGEND_PITCHER_KIA_LIVING_LEGEND_YANGHJ',
        '양현종',
        (SELECT id FROM teams WHERE team_code = 'KIA'),
        'PITCHER',
        85,
        54,
        '1988-03-01',
        '좌투/좌타',
        '["SP"]',
        '["특이폼","페이스"]',
        '{"velocity":86,"control":85,"stamina":86,"breaking":86,"movement":85}'
    ),
    (
        'LEGEND_PITCHER_LG_LEGEND_KIMYS',
        '김용수',
        (SELECT id FROM teams WHERE team_code = 'LG'),
        'PITCHER',
        83,
        41,
        '1960-05-02',
        '우투/우타',
        '["CP"]',
        '["특이폼","페이스"]',
        '{"velocity":87,"control":82,"stamina":71,"breaking":86,"movement":89}'
    ),
    (
        'LEGEND_PITCHER_HAN_LEGEND_KOODS',
        '구대성',
        (SELECT id FROM teams WHERE team_code = 'HAN'),
        'PITCHER',
        87,
        15,
        '1969-08-02',
        '좌투/좌타',
        '["CP"]',
        '["특이폼","페이스"]',
        '{"velocity":93,"control":92,"stamina":71,"breaking":89,"movement":90}'
    ),
    (
        'LEGEND_PITCHER_SAM_LEGEND_LIMGIHYO',
        '임기효',
        (SELECT id FROM teams WHERE team_code = 'SAM'),
        'PITCHER',
        84,
        97,
        '1977-06-02',
        '우투/우타',
        '["CP"]',
        '[]',
        '{"velocity":89,"control":91,"stamina":68,"breaking":86,"movement":88}'
    ),
    (
        'LEGEND_PITCHER_PAC_LEGEND_JEONGMEONGWON',
        '정명원',
        (SELECT id FROM teams WHERE team_code = 'PAC'),
        'PITCHER',
        81,
        28,
        '1966-06-14',
        '우투/우타',
        '["CP"]',
        '["특이폼","페이스"]',
        '{"velocity":88,"control":83,"stamina":69,"breaking":80,"movement":87}'
    ),
    (
        'LEGEND_PITCHER_SAM_LEGEND_OHSEUNGHWAN',
        '오승환',
        (SELECT id FROM teams WHERE team_code = 'SAM'),
        'PITCHER',
        84,
        28,
        '1982-07-15',
        '우투/우타',
        '["CP"]',
        '["특이폼","페이스"]',
        '{"velocity":89,"control":89,"stamina":65,"breaking":95,"movement":84}'
    );
