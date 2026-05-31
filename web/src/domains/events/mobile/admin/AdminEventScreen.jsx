import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import {
  requestAdminGetAllEventList,
  requestAdminInsertNewExEvent,
  requestAdminUpdateExEvent,
  requestAdminDeleteEvent,
} from "@/domains/events/store/admin/thunks.js";
import styles from "./AdminEventScreen.module.scss";

const EVENT_TYPES = ["EXTERNAL", "INTERNAL", "PROMOTION"];

const EMPTY_FORM = {
  title: "",
  eventType: "EXTERNAL",
  startAt: "",
  expireAt: "",
  imageUrl: "",
  externalLink: "",
  visible: true,
};

export default function AdminEventScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((s) => s.events);

  useSetTopBar({ variant: "page", title: "이벤트 관리", onBack: () => navigate(-1) });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [visibleFilter, setVisibleFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    dispatch(requestAdminGetAllEventList());
  }, [dispatch]);

  const filtered = events.filter((e) => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || e.eventType === typeFilter;
    const matchVisible =
      visibleFilter === "all" ||
      (visibleFilter === "visible" && e.visible) ||
      (visibleFilter === "hidden" && !e.visible);
    return matchSearch && matchType && matchVisible;
  });

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  };

  const openEdit = (event) => {
    setEditTarget(event);
    setForm({
      title: event.title ?? "",
      eventType: event.eventType ?? "EXTERNAL",
      startAt: event.startAt?.slice(0, 10) ?? "",
      expireAt: event.expireAt?.slice(0, 10) ?? "",
      imageUrl: event.imageUrl ?? "",
      externalLink: event.externalLink ?? "",
      visible: event.visible ?? true,
    });
    setSheetOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("이벤트를 삭제하시겠습니까?")) return;
    dispatch(requestAdminDeleteEvent(id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTarget) {
      dispatch(requestAdminUpdateExEvent({ id: editTarget.id, ...form }));
    } else {
      dispatch(requestAdminInsertNewExEvent(form));
    }
    setSheetOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  /* 상태 분기 */
  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>불러오는 중...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateError}>{error}</p>
          <button className={styles.retryBtn} onClick={() => dispatch(requestAdminGetAllEventList())}>
            다시 시도
          </button>
        </div>
      );
    }
    if (filtered.length === 0) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>이벤트가 없습니다.</p>
        </div>
      );
    }
    return (
      <ul className={styles.list}>
        {filtered.map((ev) => (
          <li key={ev.id} className={styles.card}>
            {ev.imageUrl && (
              <img className={styles.thumbnail} src={ev.imageUrl} alt={ev.title} />
            )}
            <div className={styles.cardBody}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{ev.title}</span>
                <span className={`${styles.chip} ${ev.visible ? styles.chipOn : styles.chipOff}`}>
                  {ev.visible ? "노출" : "숨김"}
                </span>
              </div>
              <div className={styles.cardMeta}>
                <span className={styles.typeChip}>{ev.eventType}</span>
                <span className={styles.cardDate}>
                  {ev.startAt?.slice(0, 10)} ~ {ev.expireAt?.slice(0, 10)}
                </span>
              </div>
              <div className={styles.cardActions}>
                <button className={styles.editBtn} onClick={() => openEdit(ev)}>수정</button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(ev.id)}>삭제</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={styles.page}>
      {/* 검색 + 필터 */}
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="이벤트 제목 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filterChips}>
          <button
            className={`${styles.chip} ${typeFilter === "all" ? styles.chipActive : ""}`}
            onClick={() => setTypeFilter("all")}
          >전체</button>
          {EVENT_TYPES.map((t) => (
            <button
              key={t}
              className={`${styles.chip} ${typeFilter === t ? styles.chipActive : ""}`}
              onClick={() => setTypeFilter(t)}
            >{t}</button>
          ))}
          <button
            className={`${styles.chip} ${visibleFilter === "visible" ? styles.chipActive : ""}`}
            onClick={() => setVisibleFilter(visibleFilter === "visible" ? "all" : "visible")}
          >노출만</button>
        </div>
      </div>

      {/* 등록 버튼 */}
      <div className={styles.addRow}>
        <button className={styles.addBtn} onClick={openCreate}>+ 이벤트 등록</button>
      </div>

      {renderContent()}

      {/* Bottom Sheet */}
      {sheetOpen && (
        <div className={styles.overlay} onClick={() => setSheetOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.sheetTitle}>{editTarget ? "이벤트 수정" : "이벤트 등록"}</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>
                제목
                <input className={styles.input} name="title" value={form.title} onChange={handleFormChange} required />
              </label>
              <label className={styles.label}>
                이벤트 타입
                <select className={styles.input} name="eventType" value={form.eventType} onChange={handleFormChange}>
                  {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className={styles.label}>
                시작일
                <input className={styles.input} type="date" name="startAt" value={form.startAt} onChange={handleFormChange} required />
              </label>
              <label className={styles.label}>
                종료일
                <input className={styles.input} type="date" name="expireAt" value={form.expireAt} onChange={handleFormChange} required />
              </label>
              <label className={styles.label}>
                이미지 URL
                <input className={styles.input} name="imageUrl" value={form.imageUrl} onChange={handleFormChange} placeholder="https://..." />
              </label>
              <label className={styles.label}>
                외부 링크
                <input className={styles.input} name="externalLink" value={form.externalLink} onChange={handleFormChange} placeholder="https://..." />
              </label>
              <label className={styles.checkLabel}>
                <input type="checkbox" name="visible" checked={form.visible} onChange={handleFormChange} />
                노출 여부
              </label>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setSheetOpen(false)}>취소</button>
                <button type="submit" className={styles.submitBtn}>{editTarget ? "수정" : "등록"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
