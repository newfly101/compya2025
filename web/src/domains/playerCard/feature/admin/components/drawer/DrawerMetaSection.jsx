import styles from "@/domains/playerCard/feature/admin/components/drawer/AdminDrawer.module.scss";
import React from "react";
import { useSelector } from "react-redux";

const DrawerMetaSection = ({ form, onChange }) => {
  const { teamList } = useSelector(state => state.playerCard);

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
        <label>Overall</label>
        <input type="number" name="overall" value={form.meta.overall} onChange={onChange} />
      </div>

      <div className={styles.field}>
        <label>등번호</label>
        <input type="number" name="backNumber" value={form.meta.backNumber} onChange={onChange} />
      </div>

      <div className={styles.field}>
        <label>생년월일</label>
        <input type="date" name="birthDate" value={form.meta.birthDate} onChange={onChange} />
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
        <input
          name="positions"
          value={form.meta.positions}
          onChange={onChange}
          placeholder='["C","1B"]'
        />
      </div>

      <div className={styles.field}>
        <label>특성 (JSON)</label>
        <input
          name="traits"
          value={form.meta.traits}
          onChange={onChange}
          placeholder='["특이폼","페이스"]'
        />
      </div>

    </div>
  </div>
)};

export default DrawerMetaSection;
