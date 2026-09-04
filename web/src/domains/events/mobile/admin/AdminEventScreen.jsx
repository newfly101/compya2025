import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminPagination from "@/global/ui/admin/pagination/AdminPagination.jsx";
import useAdminPagination from "@/global/ui/admin/pagination/useAdminPagination.js";
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
  requestAdminUploadEventImage,
  requestAdminBulkDeleteEvents,
  requestAdminBulkUpdateEventsVisible,
} from "@/domains/events/store/admin/thunks.js";
import styles from "./AdminEventScreen.module.scss";

// DB site_events.event_type enum('OFFICIAL','INTERNAL'). 프로토타입(핸드오프)은 "출처는 공식
// 고정(자체 이벤트 없음)" 이라 등록 폼에 출처 필드를 두지 않지만, 실제 데이터에 INTERNAL 레코드가
// 1건 존재해(sql/V2/site/INSERT_SITE_EVENTS_DATA.sql id=15) 값 자체를 지우면 그 레코드가 깨진다.
// 절충: 신규 등록은 항상 OFFICIAL 로 고정하고, 기존 레코드를 수정할 때는 원래 eventType 을 그대로
// 보존한다(폼에 변경 UI 자체를 두지 않음) — v2 리스트 태그는 더 이상 공식/자체가 아니라 진행 상태를
// 보여준다(핸드오프 스크린샷 기준). eventType 값 자체는 저장 시 계속 보존된다.
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

// v2 "진행" 필터: 전체 · 진행중 · 종료. "종료" 카운트 API 가 없어 쿠폰 만료 판정과 동일하게
// 클라이언트에서 expireAt 비교로 처리한다.
const isEnded = (event) => {
  const d = event.expireAt?.slice(0, 10);
  return !!d && d < todayStr();
};

const STATUS_MATCH = {
  all: () => true,
  ongoing: (e) => !isEnded(e),
  ended: (e) => isEnded(e),
};

const STATUS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "ongoing", label: "진행중" },
  { value: "ended", label: "종료" },
];

// v2 "노출" 필터: 전체 · 노출 · 숨김 (visible 기준, 진행 상태와 독립적인 축).
const VIS_MATCH = {
  all: () => true,
  visible: (e) => !!e.visible,
  hidden: (e) => !e.visible,
};

const VIS_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "visible", label: "노출" },
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

// 목록이 전량 내려온다는 전제로 클라이언트에서 8개씩 잘라 보여준다(v2 번호식 페이지네이션).
// "더 보기"(서버 페이징)를 대체하므로 한 번에 넉넉히 요청한다.
const EVENTS_FETCH_ALL_SIZE = 1000;

// 어드민 셸(AdminShellScreen)의 이벤트 탭 패널로 렌더된다 — 자체 TopBar 를 세팅하지 않는다.
// 셸이 상단바(제목/로그아웃)를 한 번만 소유하고, 탭 전환은 뒤로가기가 아니라 탭 클릭으로 처리된다.
export default function AdminEventScreen() {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((s) => s.events);

  const [search, setSearch] = useState("");
  // v2 기본값 — 진행:전체 / 노출:전체 (스크린샷 기준 초기 진입 상태)
  const [status, setStatus] = useState("all");
  const [vis, setVis] = useState("all");
  const [sortDesc, setSortDesc] = useState(true); // 기본: 기간 최신순(시작일 내림차순)
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageSource, setImageSource] = useState("url");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkNotice, setBulkNotice] = useState(null);

  const { editTarget, isOpen, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  useEffect(() => {
    dispatch(requestAdminGetAllEventList({ page: 0, size: EVENTS_FETCH_ALL_SIZE }));
  }, [dispatch]);

  const searched = events.filter((e) => e.title?.toLowerCase().includes(search.toLowerCase()));

  const statusOptions = STATUS_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter((e) => STATUS_MATCH[opt.value](e) && VIS_MATCH[vis](e)).length,
  }));

  const visOptions = VIS_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter((e) => VIS_MATCH[opt.value](e) && STATUS_MATCH[status](e)).length,
  }));

  const filtered = searched
    .filter((e) => STATUS_MATCH[status](e) && VIS_MATCH[vis](e))
    .sort((a, b) => {
      const da = a.startAt?.slice(0, 10) ?? "";
      const db = b.startAt?.slice(0, 10) ?? "";
      return sortDesc ? db.localeCompare(da) : da.localeCompare(db);
    });

  // 번호식 페이지네이션(8개/페이지, 클라이언트 슬라이스) — 검색/필터/정렬이 바뀌면 1페이지로.
  const { page, pageCount, pageItems, setPage, resetPage } = useAdminPagination(filtered, 8);
  useEffect(() => {
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, vis, sortDesc]);

  // 현재 페이지에 없는 행의 선택은 자동으로 떨어져 나간다(다음 페이지 이동 시 실수 방지).
  const pageIds = useMemo(() => new Set(pageItems.map((e) => e.id)), [pageItems]);
  const selectedOnPageCount = pageItems.filter((e) => selectedIds.has(e.id)).length;
  const allSelectedOnPage = pageItems.length > 0 && selectedOnPageCount === pageItems.length;

  const toggleRow = (event) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(event.id)) next.delete(event.id);
      else next.add(event.id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) => (allSelectedOnPage ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  // 일괄 삭제·숨김 — BE 응답이 200 이어도 { successIds, failedIds } 에 실패가 섞여 올 수 있다.
  // successIds 만 스토어에 반영되고(slice), failedIds 가 있으면 배너로 알린다.
  // 삭제는 되돌릴 수 없어 확인 다이얼로그를 거친다 — 숨김은 언제든 다시 켤 수 있어 바로 실행.
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = async () => {
    const ids = [...selectedIds];
    setBulkDeleteConfirmOpen(false);
    setSelectedIds(new Set());
    try {
      const { failedIds } = await dispatch(requestAdminBulkDeleteEvents(ids)).unwrap();
      setBulkNotice(failedIds?.length ? `${failedIds.length}개는 삭제하지 못했습니다.` : null);
    } catch (err) {
      setBulkNotice(typeof err === "string" ? err : "일괄 삭제에 실패했습니다.");
    }
  };

  const handleBulkHide = async () => {
    if (selectedIds.size === 0) return;
    const ids = [...selectedIds];
    setSelectedIds(new Set());
    try {
      const { failedIds } = await dispatch(
        requestAdminBulkUpdateEventsVisible({ ids, visible: false }),
      ).unwrap();
      setBulkNotice(failedIds?.length ? `${failedIds.length}개는 숨김 처리하지 못했습니다.` : null);
    } catch (err) {
      setBulkNotice(typeof err === "string" ? err : "일괄 숨김 처리에 실패했습니다.");
    }
  };

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

  // v2 열 구성 — 체크박스(28, AdminTable 고정) · # · 이벤트(썸네일+상태태그+제목) · 기간 · 노출 · 관리(수정).
  // 448px 컨테이너 기준: 28 + 22 + 76 + 44 + 56 = 226 고정, 이벤트 칸이 나머지 222 를 흡수.
  const columns = [
    {
      key: "idx",
      label: "#",
      width: 22,
      render: (_e, index) => <span className={styles.idx}>{page * 8 + index + 1}</span>,
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
          <div className={styles.titleRow}>
            <AdminTag variant={isEnded(e) ? "neutral" : "green"}>
              {isEnded(e) ? "종료" : "진행중"}
            </AdminTag>
            <span className={styles.title}>{e.title}</span>
          </div>
        </div>
      ),
    },
    {
      key: "period",
      label: "기간",
      width: 76,
      render: (e) => <span className={styles.periodCell}>{formatPeriod(e.startAt, e.expireAt)}</span>,
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
      width: 56,
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
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="이벤트 제목 검색"
        filters={[
          { key: "status", label: "진행", options: statusOptions, value: status, onChange: setStatus },
          { key: "vis", label: "노출", options: visOptions, value: vis, onChange: setVis },
        ]}
        totalCount={filtered.length}
        totalLabel="개"
        sortLabel={sortDesc ? "기간 최신순" : "기간 오래된순"}
        onToggleSort={() => setSortDesc((prev) => !prev)}
        onCreate={handleOpenCreate}
        createLabel="등록"
        selectedCount={selectedOnPageCount}
        onBulkDelete={handleBulkDelete}
        onBulkHide={handleBulkHide}
      />

      {bulkNotice && (
        <div className={styles.bulkNotice}>
          <span>{bulkNotice}</span>
          <button type="button" onClick={() => setBulkNotice(null)} aria-label="닫기">
            ×
          </button>
        </div>
      )}

      {loading && events.length === 0 && <AdminStateBox status="loading" />}
      {!loading && error && events.length === 0 && (
        <AdminStateBox
          status="error"
          message={error}
          onRetry={() => dispatch(requestAdminGetAllEventList({ page: 0, size: EVENTS_FETCH_ALL_SIZE }))}
        />
      )}
      {!loading && !(error && events.length === 0) && filtered.length === 0 && (
        <AdminStateBox status="empty" message="이벤트가 없습니다." />
      )}
      {!(loading && events.length === 0) && !(error && events.length === 0) && filtered.length > 0 && (
        <>
          <AdminTable
            columns={columns}
            rows={pageItems}
            rowKey={(e) => e.id}
            selectable
            selectedKeys={selectedIds}
            allSelected={allSelectedOnPage}
            onToggleRow={toggleRow}
            onToggleAll={toggleAllOnPage}
          />
          <AdminPagination page={page} pageCount={pageCount} onChange={setPage} />
        </>
      )}

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
        open={bulkDeleteConfirmOpen}
        title="이벤트 일괄 삭제"
        message={`선택한 이벤트 ${selectedIds.size}개를 삭제하시겠습니까?`}
        dangerous
        confirmLabel="삭제"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  );
}
