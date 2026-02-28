import styles from "@/domains/playerCard/feature/admin/components/drawer/AdminDrawer.module.scss";
import React from "react";
import { useSelector } from "react-redux";
import {
  HITTER_POSITION_OPTIONS,
  PITCHER_POSITION_OPTIONS,
  TRAIT_OPTIONS,
} from "@/domains/playerCard/config/PlayerTableConfig.js";
import { useFormFormats } from "@/domains/playerCard/utils/useFormFormats.js";

const DrawerMetaSection = ({ form, onChange, onBirthDateChange, onMultiChange }) => {
  const { teamList } = useSelector(state => state.playerCard);
  const { formatBirthDate, parseArray, stringifyArray } = useFormFormats();

  // 선택 추가 logic
  const handleAddItem = (name, value) => {
    if (!value) return;

    const current = parseArray(form.meta[name]);

    if (current.includes(value)) return;

    const updated = [...current, value];

    onChange({
      target: {
        name,
        value: stringifyArray(updated),
      },
    });
  };

  // 제거 로직
  const handleRemoveItem = (name, value) => {
    const current = parseArray(form.meta[name]);

    const updated = current.filter((item) => item !== value);

    onChange({
      target: {
        name,
        value: stringifyArray(updated),
      },
    });
  };

  const role = form.meta.role;

  const POSITION_OPTIONS =
    role === "PITCHER"
      ? PITCHER_POSITION_OPTIONS :
      role === "HITTER" ? HITTER_POSITION_OPTIONS
      : [] ;

  const selectedPositions = parseArray(form.meta.positions);
  const availablePositions = POSITION_OPTIONS.filter(
    (p) => !selectedPositions.includes(p)
  );

  const selectedTraits = parseArray(form.meta.traits);
  const availableTraits = TRAIT_OPTIONS.filter(
    (t) => !selectedTraits.includes(t)
  );

  return (
  <div className={styles.sectionWrapper}>
    <h3 className={styles.sectionTitle}>기본 정보</h3>

    <div className={styles.metaGrid}>

      <div className={styles.field}>
        <label>구단</label>
        <select name="teamId" value={form.meta.teamId} onChange={onChange}>
          <option value="">팀 선택</option>
          {teamList?.map((team) => (
            <option key={team.id} value={team.teamName}>{team.teamName}</option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label>이름</label>
        <input
          name="name"
          value={form.meta.name}
          onChange={onChange}
        />
      </div>

      <div className={styles.field}>
        <label>카드 코드</label>
        <input
          name="cardCode"
          value={form.meta.cardCode}
          onChange={onChange}
          disabled
        />
      </div>


      <div className={styles.field}>
        <label>포지션 타입</label>
        <select name="role" value={form.meta.role} onChange={onChange}>
          <option value="">타입 선택</option>
          <option value="HITTER">타자</option>
          <option value="PITCHER">투수</option>
        </select>
      </div>

      <div className={styles.field}>
        <label>등급</label>
        <select name="grade" value={form.meta.grade} onChange={onChange}>
          <option value="">등급 선택</option>
          <option value="LEGEND">LEGEND</option>
          <option value="EPIC">EPIC</option>
        </select>
      </div>

      <div className={styles.field}>
        <label>시즌</label>
        <input
          type="number"
          name="seasonYear"
          value={form.meta.seasonYear || ""}
          onChange={onChange}
          placeholder="2026"
        />
      </div>

      <div className={styles.field}>
        <label>오버롤</label>
        <input type="number" name="overall" value={form.meta.overall} onChange={onChange} />
      </div>

      <div className={styles.field}>
        <label>등번호</label>
        <input type="number" name="backNumber" value={form.meta.backNumber} onChange={onChange} />
      </div>

      <div className={styles.field}>
        <label>생년월일</label>
        <input type="text"
               inputMode="numeric"
               maxLength={10}
               placeholder="YYYYMMDD"
               value={form.meta.birthDate || ""}
               onChange={onBirthDateChange}
        />
      </div>

      <div className={styles.field}>
        <label>투타</label>
        <select name="batThrow" value={form.meta.batThrow} onChange={onChange}>
          <option value="">선택</option>
          <option value="우투/우타">우투/우타</option>
          <option value="우투/좌타">우투/좌타</option>
          <option value="좌투/좌타">좌투/좌타</option>
          <option value="좌투/우타">좌투/우타</option>
        </select>
      </div>

      <div className={styles.field}>
        <label>포지션 (JSON)</label>
        <select
          onChange={(e) => {
            handleAddItem("positions", e.target.value);
            e.target.value = "";
          }}
        >
          <option value="">포지션 선택</option>
          {availablePositions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>

        {/* 선택된 태그 영역 */}
        <div className={styles.tagContainer}>
          {selectedPositions.map((pos) => (
            <button
              type="button"
              key={pos}
              className={styles.tag}
              onClick={() => handleRemoveItem("positions", pos)}
            >
              {pos} ✕
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label>특성</label>

        <select
          onChange={(e) => {
            handleAddItem("traits", e.target.value);
            e.target.value = "";
          }}
        >
          <option value="">포지션 선택</option>
          {availableTraits.map((trait) => (
            <option key={trait} value={trait}>
              {trait}
            </option>
          ))}
        </select>

        {/* 선택된 태그 영역 */}
        <div className={styles.tagContainer}>
          {selectedTraits.map((trait) => (
            <button
              type="button"
              key={trait}
              className={styles.tag}
              onClick={() => handleRemoveItem("traits", trait)}
            >
              {trait} ✕
            </button>
          ))}
        </div>
      </div>

    </div>
  </div>
  )
};

export default DrawerMetaSection;
