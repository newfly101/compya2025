import React from "react";
import { useSelector } from "react-redux";
import styles from "./AdminPlayerDrawer.module.scss";
import MultiTagSelector from "./MultiTagSelector.jsx";

const DrawerMetaSection = ({ formState, formActions }) => {
  const { teamList } = useSelector((state) => state.playerCard);
  const {
    form,
    selectedPositions,
    selectedTraits,
    availablePositions,
    availableTraits,
  } = formState;
  const { handleChange, handleBirthDateChange, handleAddItem, handleRemoveItem } = formActions;

  return (
    <div className={styles.adminPlayerDrawerMetaSection}>
      <h3 className={styles.adminPlayerDrawerSectionTitle}>기본 정보</h3>

      <div className={styles.adminPlayerDrawerMetaGrid}>

        <div className={styles.adminPlayerDrawerField}>
          <label>구단</label>
          <select name="teamId" value={form.meta.teamId} onChange={handleChange}>
            <option value="">팀 선택</option>
            {teamList?.map((team) => (
              <option key={team.id} value={team.teamName}>
                {team.teamName}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.adminPlayerDrawerField}>
          <label>이름</label>
          <input name="name" value={form.meta.name} onChange={handleChange} />
        </div>

        <div className={styles.adminPlayerDrawerField}>
          <label>카드 코드</label>
          <input name="cardCode" value={form.meta.cardCode} onChange={handleChange} disabled />
        </div>

        <div className={styles.adminPlayerDrawerField}>
          <label>포지션 타입</label>
          <select name="role" value={form.meta.role} onChange={handleChange}>
            <option value="">타입 선택</option>
            <option value="HITTER">타자</option>
            <option value="PITCHER">투수</option>
          </select>
        </div>

        <div className={styles.adminPlayerDrawerField}>
          <label>등급</label>
          <select name="grade" value={form.meta.grade} onChange={handleChange}>
            <option value="">등급 선택</option>
            <option value="LEGEND">LEGEND</option>
            <option value="EPIC">EPIC</option>
          </select>
        </div>

        <div className={styles.adminPlayerDrawerField}>
          <label>시즌</label>
          <input
            type="number"
            name="seasonYear"
            value={form.meta.seasonYear || ""}
            onChange={handleChange}
            placeholder="2026"
          />
        </div>

        <div className={styles.adminPlayerDrawerField}>
          <label>오버롤</label>
          <input type="number" name="overall" value={form.meta.overall} onChange={handleChange} />
        </div>

        <div className={styles.adminPlayerDrawerField}>
          <label>등번호</label>
          <input
            type="number"
            name="backNumber"
            value={form.meta.backNumber}
            onChange={handleChange}
          />
        </div>

        <div className={styles.adminPlayerDrawerField}>
          <label>생년월일</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={10}
            placeholder="YYYYMMDD"
            value={form.meta.birthDate || ""}
            onChange={handleBirthDateChange}
          />
        </div>

        <div className={styles.adminPlayerDrawerField}>
          <label>투타</label>
          <select name="batThrow" value={form.meta.batThrow} onChange={handleChange}>
            <option value="">선택</option>
            <option value="우투/우타">우투/우타</option>
            <option value="우투/좌타">우투/좌타</option>
            <option value="좌투/좌타">좌투/좌타</option>
            <option value="좌투/우타">좌투/우타</option>
          </select>
        </div>

        <MultiTagSelector
          label="포지션"
          field="positions"
          availableOptions={availablePositions}
          selectedItems={selectedPositions}
          onAdd={handleAddItem}
          onRemove={handleRemoveItem}
        />

        <MultiTagSelector
          label="특성"
          field="traits"
          availableOptions={availableTraits}
          selectedItems={selectedTraits}
          onAdd={handleAddItem}
          onRemove={handleRemoveItem}
        />

      </div>
    </div>
  );
};

export default DrawerMetaSection;
