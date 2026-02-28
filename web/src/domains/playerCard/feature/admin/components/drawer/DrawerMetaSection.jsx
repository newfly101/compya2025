import styles from "@/domains/playerCard/feature/admin/components/drawer/AdminPlayerDrawer.module.scss";
import React from "react";
import { useSelector } from "react-redux";

const DrawerMetaSection = ({ formState, formActions }) => {
  const { teamList } = useSelector((state) => state.playerCard);

  const {
    form,
    selectedPositions,
    selectedTraits,
    availablePositions,
    availableTraits,
  } = formState;

  const {
    handleChange,
    handleAddItem,
    handleRemoveItem,
    handleBirthDateChange,
  } = formActions;

  return (
    <div className={styles.adminPlayerDrawerMetaSection}>
      <h3 className={styles.adminPlayerDrawerSectionTitle}>
        기본 정보
      </h3>

      <div className={styles.adminPlayerDrawerMetaGrid}>

        {/* 구단 */}
        <div className={styles.adminPlayerDrawerField}>
          <label>구단</label>
          <select
            name="teamId"
            value={form.meta.teamId}
            onChange={handleChange}
          >
            <option value="">팀 선택</option>
            {teamList?.map((team) => (
              <option key={team.id} value={team.teamName}>
                {team.teamName}
              </option>
            ))}
          </select>
        </div>

        {/* 이름 */}
        <div className={styles.adminPlayerDrawerField}>
          <label>이름</label>
          <input
            name="name"
            value={form.meta.name}
            onChange={handleChange}
          />
        </div>

        {/* 카드 코드 */}
        <div className={styles.adminPlayerDrawerField}>
          <label>카드 코드</label>
          <input
            name="cardCode"
            value={form.meta.cardCode}
            onChange={handleChange}
            disabled
          />
        </div>

        {/* 포지션 타입 */}
        <div className={styles.adminPlayerDrawerField}>
          <label>포지션 타입</label>
          <select
            name="role"
            value={form.meta.role}
            onChange={handleChange}
          >
            <option value="">타입 선택</option>
            <option value="HITTER">타자</option>
            <option value="PITCHER">투수</option>
          </select>
        </div>

        {/* 등급 */}
        <div className={styles.adminPlayerDrawerField}>
          <label>등급</label>
          <select
            name="grade"
            value={form.meta.grade}
            onChange={handleChange}
          >
            <option value="">등급 선택</option>
            <option value="LEGEND">LEGEND</option>
            <option value="EPIC">EPIC</option>
          </select>
        </div>

        {/* 시즌 */}
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

        {/* 오버롤 */}
        <div className={styles.adminPlayerDrawerField}>
          <label>오버롤</label>
          <input
            type="number"
            name="overall"
            value={form.meta.overall}
            onChange={handleChange}
          />
        </div>

        {/* 등번호 */}
        <div className={styles.adminPlayerDrawerField}>
          <label>등번호</label>
          <input
            type="number"
            name="backNumber"
            value={form.meta.backNumber}
            onChange={handleChange}
          />
        </div>

        {/* 생년월일 */}
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

        {/* 투타 */}
        <div className={styles.adminPlayerDrawerField}>
          <label>투타</label>
          <select
            name="batThrow"
            value={form.meta.batThrow}
            onChange={handleChange}
          >
            <option value="">선택</option>
            <option value="우투/우타">우투/우타</option>
            <option value="우투/좌타">우투/좌타</option>
            <option value="좌투/좌타">좌투/좌타</option>
            <option value="좌투/우타">좌투/우타</option>
          </select>
        </div>

        {/* 포지션 */}
        <div className={styles.adminPlayerDrawerField}>
          <label>포지션</label>
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

          <div className={styles.adminPlayerDrawerTagSection}>
            {selectedPositions.map((pos) => (
              <div
                key={pos}
                className={styles.adminPlayerDrawerTag}
              >
                <span>{pos}</span>
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveItem("positions", pos)
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 특성 */}
        <div className={styles.adminPlayerDrawerField}>
          <label>특성</label>
          <select
            onChange={(e) => {
              handleAddItem("traits", e.target.value);
              e.target.value = "";
            }}
          >
            <option value="">특성 선택</option>
            {availableTraits.map((trait) => (
              <option key={trait} value={trait}>
                {trait}
              </option>
            ))}
          </select>

          <div className={styles.adminPlayerDrawerTagSection}>
            {selectedTraits.map((trait) => (
              <div
                key={trait}
                className={styles.adminPlayerDrawerTag}
              >
                <span>{trait}</span>
                <button
                  type="button"
                  onClick={() =>
                    handleRemoveItem("traits", trait)
                  }
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DrawerMetaSection;
