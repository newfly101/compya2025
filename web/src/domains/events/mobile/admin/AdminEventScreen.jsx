import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminModal from "@/global/ui/admin/modal/AdminModal.jsx";
import AdminStateBox from "@/global/ui/admin/stateBox/AdminStateBox.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import AdminToggleSwitch from "@/global/ui/admin/toggle/AdminToggleSwitch.jsx";
import AdminTag from "@/global/ui/admin/tag/AdminTag.jsx";
import AdminSegmented from "@/global/ui/admin/fields/AdminSegmented.jsx";
import AdminDateRange from "@/global/ui/admin/fields/AdminDateRange.jsx";
import AdminFilePicker from "@/global/ui/admin/fields/AdminFilePicker.jsx";
import useTableModal from "@/global/ui/admin/hooks/useTableModal.js";
import "@/global/ui/admin/admin.tokens.scss";
import {
  requestAdminGetAllEventList,
  requestAdminInsertNewExEvent,
  requestAdminUpdateExEvent,
  requestAdminUpdateExEventVisible,
  requestAdminDeleteEvent,
  requestAdminUploadEventImage,
  EVENTS_ADMIN_PAGE_SIZE,
} from "@/domains/events/store/admin/thunks.js";
import styles from "./AdminEventScreen.module.scss";

// DB site_events.event_type enum('OFFICIAL','INTERNAL'). 프로토타입(핸드오프)은 "출처는 공식
// 고정(자체 이벤트 없음)" 이라 등록 폼에 출처 필드를 두지 않지만, 실제 데이터에 INTERNAL 레코드가
// 1건 존재해(sql/V2/site/INSERT_SITE_EVENTS_DATA.sql id=15) 값 자체를 지우면 그 레코드가 깨진다.
// 절충: 신규 등록은 항상 OFFICIAL 로 고정하고, 기존 레코드를 수정할 때는 원래 eventType 을 그대로
// 보존한다(폼에 변경 UI 자체를 두지 않음). 리스트 태그는 실제 값 기준으로 공식/자체를 구분 표시한다.
const EVENT_TYPE_LABELS = { OFFICIAL: "공식", INTERNAL: "자체" };

const IMAGE_SOURCE_OPTIONS = [
  { value: "url", label: "URL 입력" },
  { value: "upload", label: "파일 업로드" },
];

const EMPTY_FORM = {
  title: "",
  eventType: "OFFICIAL",
  startAt: "",
  expireAt: "",
  imageUrl: "",
  externalLink: "",
  visible: true,
};

const formOf = (event) => ({
  title: event.title ?? "",
  eventType: event.eventType ?? "OFFICIAL",
  startAt: event.startAt?.slice(0, 10) ?? "",
  expireAt: event.expireAt?.slice(0, 10) ?? "",
  imageUrl: event.imageUrl ?? "",
  externalLink: event.externalLink ?? "",
  visible: event.visible ?? true,
});

// 업로드 응답 형태가 raw string / { url, fileName } / 래핑된 { data: {...} } 중 무엇이 오든 URL 을 뽑아낸다.
const extractUploadedUrl = (result) => {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    if (typeof result.url === "string") return result.url;
    if (result.data) return extractUploadedUrl(result.data);
  }
  return null;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

// 프로토타입 § 4 이벤트 칩: 전체 · 진행중 · 종료 · 숨김.
// "종료" 카운트 API 가 없어 클라이언트에서 expireAt 비교로 판정한다(쿠폰 만료 판정과 동일 패턴).
const isEnded = (event) => {
  const d = event.expireAt?.slice(0, 10);
  return !!d && d < todayStr();
};

const CHIP_MATCH = {
  all: () => true,
  ongoing: (e) => e.visible && !isEnded(e),
  ended: (e) => isEnded(e),
  hidden: (e) => !e.visible,
};

const CHIP_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "ongoing", label: "진행중" },
  { value: "ended", label: "종료" },
  { value: "hidden", label: "숨김" },
];

const formatPeriod = (startAt, expireAt) => {
  const md = (d) => {
    const s = d?.slice(0, 10);
    if (!s) return "-";
    const [, m, day] = s.split("-");
    return `${m}.${day}`;
  };
  return `${md(startAt)} ~ ${md(expireAt)}`;
};

const fileNameOf = (url) => {
  if (!url) return "";
  try {
    return decodeURIComponent(url.split("/").pop() ?? "");
  } catch {
    return url;
  }
};

// 어드민 셸(AdminShellScreen)의 이벤트 탭 패널로 렌더된다 — 자체 TopBar 를 세팅하지 않는다.
// 셸이 상단바(제목/로그아웃)를 한 번만 소유하고, 탭 전환은 뒤로가기가 아니라 탭 클릭으로 처리된다.
export default function AdminEventScreen() {
  const dispatch = useDispatch();
  const { events, loading, error, page, hasMore } = useSelector((s) => s.events);

  const [search, setSearch] = useState("");
  const [chip, setChip] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageSource, setImageSource] = useState("url");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const { editTarget, isOpen, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  useEffect(() => {
    dispatch(requestAdminGetAllEventList({ page: 0, size: EVENTS_ADMIN_PAGE_SIZE }));
  }, [dispatch]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await dispatch(
        requestAdminGetAllEventList({ page: page + 1, size: EVENTS_ADMIN_PAGE_SIZE })
      ).unwrap();
    } catch {
      // 실패 시 상단 error 상태로 이미 반영됨 — 별도 처리 없음
    } finally {
      setLoadingMore(false);
    }
  };

  const searched = events.filter((e) => e.title?.toLowerCase().includes(search.toLowerCase()));

  const chipOptions = CHIP_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter(CHIP_MATCH[opt.value]).length,
  }));

  const filtered = searched.filter(CHIP_MATCH[chip]);

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setImageSource("url");
    setUploadError(null);
    openCreate();
  };

  const handleOpenEdit = (event) => {
    setForm(formOf(event));
    setImageSource("url");
    setUploadError(null);
    openEdit(event);
  };

  const closeModal = () => {
    closeCreate();
    closeEdit();
  };

  const handleDelete = (event) => setDeleteTarget(event);

  const confirmDelete = () => {
    if (deleteTarget) dispatch(requestAdminDeleteEvent(deleteTarget.id));
    setDeleteTarget(null);
  };

  // 리스트에서 즉시 저장(optimistic) — 전체 수정 API 가 아니라 전용 부분 변경
  // 엔드포인트(PATCH /admin/events/{id}/visible → requestAdminUpdateExEventVisible)를 쓴다.
  const handleToggleVisible = (event, nextVisible) => {
    dispatch(requestAdminUpdateExEventVisible({ id: event.id, visible: nextVisible }));
  };

  const handleImageFileChange = async (file) => {
    setUploading(true);
    setUploadError(null);
    try {
      const result = await dispatch(requestAdminUploadEventImage(file)).unwrap();
      const url = extractUploadedUrl(result);
      if (!url) throw new Error("업로드 응답에서 URL 을 찾을 수 없습니다.");
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setUploadError(typeof err === "string" ? err : err?.message ?? "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTarget) {
      dispatch(requestAdminUpdateExEvent({ id: editTarget.id, ...form }));
    } else {
      dispatch(requestAdminInsertNewExEvent(form));
    }
    closeModal();
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const columns = [
    {
      key: "index",
      label: "번호",
      width: 30,
      render: (_e, index) => index + 1,
    },
    {
      key: "title",
      label: "이벤트",
      align: "left",
      render: (e) => (
        <div className={styles.mainCell}>
          {e.imageUrl ? (
            <img className={styles.thumb} src={e.imageUrl} alt="" />
          ) : (
            <div className={styles.thumbEmpty} />
          )}
          <div className={styles.mainCellText}>
            <div className={styles.titleRow}>
              <AdminTag variant={e.eventType === "OFFICIAL" ? "purple" : "neutral"}>
                {EVENT_TYPE_LABELS[e.eventType] ?? e.eventType}
              </AdminTag>
              <span className={styles.title}>{e.title}</span>
            </div>
            <span className={styles.period}>{formatPeriod(e.startAt, e.expireAt)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "visible",
      label: "노출",
      width: 44,
      render: (e) => (
        <AdminToggleSwitch
          checked={e.visible}
          onChange={(next) => handleToggleVisible(e, next)}
          label={`${e.title} 노출 여부`}
        />
      ),
    },
    {
      key: "actions",
      label: "관리",
      width: 88,
      render: (e) => (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={(ev) => {
              ev.stopPropagation();
              handleOpenEdit(e);
            }}
          >
            수정
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={(ev) => {
              ev.stopPropagation();
              handleDelete(e);
            }}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  const renderBody = () => {
    if (loading && events.length === 0) return <AdminStateBox status="loading" />;
    if (error && events.length === 0) {
      return (
        <AdminStateBox
          status="error"
          message={error}
          onRetry={() => dispatch(requestAdminGetAllEventList({ page: 0, size: EVENTS_ADMIN_PAGE_SIZE }))}
        />
      );
    }
    if (filtered.length === 0) return <AdminStateBox status="empty" message="이벤트가 없습니다." />;

    return (
      <>
        <AdminTable
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          onRowClick={(e) => setExpandedId((prev) => (prev === e.id ? null : e.id))}
          expandedKey={expandedId}
          renderDetail={(e) => (
            <div className={styles.detail}>
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>상세 링크</span>
                <span className={styles.detailValue}>{e.externalLink || "-"}</span>
              </div>
            </div>
          )}
        />
        {hasMore && (
          <div className={styles.loadMoreRow}>
            <button className={styles.loadMoreBtn} onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? "불러오는 중..." : "더 보기"}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={styles.page}>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="이벤트 제목 검색"
        filters={[{ key: "chip", options: chipOptions, value: chip, onChange: setChip }]}
        totalCount={filtered.length}
        totalLabel="개"
        onCreate={handleOpenCreate}
        createLabel="이벤트 등록"
      />

      {renderBody()}

      <AdminModal open={isOpen} title={editTarget ? "이벤트 수정" : "이벤트 등록"} onClose={closeModal}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            이벤트명
            <input className={styles.input} name="title" value={form.title} onChange={handleFormChange} required />
          </label>

          <div className={styles.label}>
            이미지
            <AdminSegmented options={IMAGE_SOURCE_OPTIONS} value={imageSource} onChange={setImageSource} name="imageSource" />
            {imageSource === "url" ? (
              <input
                className={styles.input}
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleFormChange}
                placeholder="https://..."
                required
              />
            ) : (
              <AdminFilePicker
                fileName={fileNameOf(form.imageUrl)}
                onFileSelect={handleImageFileChange}
                disabled={uploading}
              />
            )}
            {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
            {imageSource === "upload" && form.imageUrl && (
              <img className={styles.uploadPreview} src={form.imageUrl} alt="이벤트 이미지 미리보기" />
            )}
          </div>

          <label className={styles.label}>
            상세 링크
            <input className={styles.input} name="externalLink" value={form.externalLink} onChange={handleFormChange} placeholder="https://..." />
          </label>

          <div className={styles.label}>
            기간
            <AdminDateRange
              start={form.startAt}
              end={form.expireAt}
              onStartChange={(v) => setForm((prev) => ({ ...prev, startAt: v }))}
              onEndChange={(v) => setForm((prev) => ({ ...prev, expireAt: v }))}
              name="period"
            />
          </div>

          <div className={styles.toggleRow}>
            <span>노출 여부</span>
            <AdminToggleSwitch
              checked={form.visible}
              onChange={(next) => setForm((prev) => ({ ...prev, visible: next }))}
              label="노출 여부"
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={closeModal}>취소</button>
            <button type="submit" className={styles.submitBtn}>{editTarget ? "수정" : "등록"}</button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="이벤트 삭제"
        message={`"${deleteTarget?.title ?? ""}" 이벤트를 삭제하시겠습니까?`}
        dangerous
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
