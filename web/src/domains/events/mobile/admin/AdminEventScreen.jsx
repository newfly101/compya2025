import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminPagination from "@/global/ui/admin/pagination/AdminPagination.jsx";
import useAdminPagination from "@/global/ui/admin/pagination/useAdminPagination.js";
import AdminModal from "@/global/ui/admin/modal/AdminModal.jsx";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import AdminToggleSwitch from "@/global/ui/admin/toggle/AdminToggleSwitch.jsx";
import AdminTag from "@/global/ui/admin/tag/AdminTag.jsx";
import AdminSegmented from "@/global/ui/admin/fields/AdminSegmented.jsx";
import AdminDateRange from "@/global/ui/admin/fields/AdminDateRange.jsx";
import AdminFilePicker from "@/global/ui/admin/fields/AdminFilePicker.jsx";
import useTableModal from "@/global/ui/admin/hooks/useTableModal.js";
import { formatNow, normalizeHHMM, toHHMMSS } from "@/global/utils/datetime/dateUtils";
import "@/global/ui/admin/admin.tokens.scss";
import { extractUploadedUrl } from "@/infra/api/uploads/index.js";
import {
  requestAdminGetAllEventList,
  requestAdminInsertNewExEvent,
  requestAdminUpdateExEvent,
  requestAdminUpdateExEventVisible,
  requestAdminUploadEventImage,
  requestAdminBulkDeleteEvents,
  requestAdminBulkUpdateEventsVisible,
  requestAdminSyncCafe,
  requestAdminRefreshCollected,
} from "@/domains/events/store/admin/thunks.js";
import EventDetailModal from "@/domains/events/mobile/components/eventDetailModal/EventDetailModal.jsx";
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

// startTime/expireTime 은 폼 전용 필드다 — 저장 직전에 날짜와 합쳐 startAt/expireAt 한 값으로 보낸다.
// 비워 두면 날짜만 전송되고 서버가 기본 시각(시작 12:00 / 종료 23:59:59)을 채운다.
const EMPTY_FORM = {
  title: "",
  eventType: "OFFICIAL",
  startAt: "",
  startTime: "",
  expireAt: "",
  expireTime: "",
  imageUrl: "",
  externalLink: "",
  visible: true,
};

// 편집 모달은 원본 시각까지 채운다 — 날짜만 담아 두면 제목만 고쳐 저장해도 서버 기본 시각으로 덮어써졌다.
// 응답 형식은 "yyyy-MM-dd HH:mm:ss"(EventResponse @JsonFormat) 이라 11~19 가 시각이다.
// 화면엔 HH:mm 만 보여준다(초는 저장 시 toHHMMSS 가 다시 붙인다 — 23:59 는 23:59:59, 그 밖엔 :00).
const formOf = (event) => ({
  title: event.title ?? "",
  eventType: event.eventType ?? "OFFICIAL",
  startAt: event.startAt?.slice(0, 10) ?? "",
  startTime: event.startAt?.slice(11, 16) ?? "",
  expireAt: event.expireAt?.slice(0, 10) ?? "",
  expireTime: event.expireAt?.slice(11, 16) ?? "",
  imageUrl: event.imageUrl ?? "",
  externalLink: event.externalLink ?? "",
  visible: event.visible ?? true,
});

// v2 "진행" 필터: 전체 · 진행중 · 종료. "종료" 카운트 API 가 없어 클라이언트에서 expireAt 비교로 처리한다.
// 기준은 공개 화면(useEventList)과 같은 KST 초 단위다 — 날짜 단위 UTC 비교였을 때는 오전에 끝난
// 이벤트가 관리자 화면에서만 자정까지 "진행중" 으로 남아 두 화면이 서로 어긋났다.
const isEnded = (event, now) => !!event.expireAt && event.expireAt < now;

const STATUS_MATCH = {
  all: () => true,
  ongoing: (e, now) => !isEnded(e, now),
  ended: (e, now) => isEnded(e, now),
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

// 수집함 = 공식 카페에서 자동 수집된 초안(source_article_id 있고 비공개). 승인 = 기존 노출 토글로 공개.
const isCollected = (e) => e.sourceArticleId != null && !e.visible;

// 수집함 행 배지 — 구간 못 찾음(본문 없음) · 원문 변경(해시 불일치) · 마감 미확인.
const collectedBadges = (e) => {
  const badges = [];
  if (!e.contentHtml) badges.push("구간 못 찾음");
  if (e.sourceChanged) badges.push("원문 변경");
  if (e.deadlineUnconfirmed) badges.push("마감 미확인");
  return badges;
};

// 지금 수집 결과(건수 요약) → 알림 문구. 필드가 없으면 0건으로 본다.
const syncNotice = (r) =>
  `수집 완료 — 새 이벤트 ${r?.created ?? 0}건 · 갱신 ${r?.updated ?? 0}건 · 새 쿠폰 ${r?.coupons ?? 0}건 · 실패 ${r?.failed ?? 0}건`;

// 시각이 비면 날짜만 보낸다(서버가 기본 시각을 채움). 시각이 있으면 HH:MM 을 HH:MM:SS 로 변환해 합친다.
const joinDateTime = (date, time) => (date && time ? `${date} ${toHHMMSS(time)}` : date ?? "");

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
  const { events, loading, error, hasMore } = useSelector((s) => s.events);
  // 진행/종료 판정 기준 시각 — 공개 화면과 같은 KST 분 단위 문자열. 렌더마다 재계산한다.
  const now = formatNow();

  const [search, setSearch] = useState("");
  // v2 기본값 — 진행:전체 / 노출:전체 (스크린샷 기준 초기 진입 상태)
  const [status, setStatus] = useState("all");
  const [vis, setVis] = useState("all");
  const [source, setSource] = useState("all"); // all | collected(수집함)
  const [syncing, setSyncing] = useState(false);
  const [previewEvent, setPreviewEvent] = useState(null);
  const [sortDesc, setSortDesc] = useState(true); // 기본: 기간 최신순(시작일 내림차순)
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageSource, setImageSource] = useState("url");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkNotice, setBulkNotice] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [saving, setSaving] = useState(false);

  const { editTarget, isOpen, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  useEffect(() => {
    dispatch(requestAdminGetAllEventList({ page: 0, size: EVENTS_FETCH_ALL_SIZE }));
  }, [dispatch]);

  const collectedCount = events.filter(isCollected).length;
  const searched = events
    .filter((e) => e.title?.toLowerCase().includes(search.toLowerCase()))
    .filter((e) => source === "all" || isCollected(e));
  const sourceOptions = [
    { value: "all", label: "전체" },
    { value: "collected", label: "수집함", count: collectedCount },
  ];

  const statusOptions = STATUS_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter((e) => STATUS_MATCH[opt.value](e, now) && VIS_MATCH[vis](e)).length,
  }));

  const visOptions = VIS_OPTIONS.map((opt) => ({
    ...opt,
    count: searched.filter((e) => VIS_MATCH[opt.value](e) && STATUS_MATCH[status](e, now)).length,
  }));

  const filtered = searched
    .filter((e) => STATUS_MATCH[status](e, now) && VIS_MATCH[vis](e))
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
  }, [search, status, vis, source, sortDesc]);

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
    setSubmitError(null);
    openCreate();
  };

  const handleOpenEdit = (event) => {
    setForm(formOf(event));
    setImageSource("url");
    setUploadError(null);
    setSubmitError(null);
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

  // 승인 = 기존 노출 토글(visible)을 켠다. 수집 초안이 공개 목록으로 넘어간다.
  const handleApprove = (event) => {
    dispatch(requestAdminUpdateExEventVisible({ id: event.id, visible: true }));
  };

  const handleRefresh = async (event) => {
    try {
      await dispatch(requestAdminRefreshCollected(event.id)).unwrap();
      setBulkNotice("본문을 원문 기준으로 갱신했습니다.");
    } catch (err) {
      setBulkNotice(typeof err === "string" ? err : "본문 갱신에 실패했습니다.");
    }
  };

  // 지금 수집 — 진행 중엔 버튼 비활성, 이미 실행 중(409)이면 서버 문구로 안내. 끝나면 목록을 다시 받는다.
  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const result = await dispatch(requestAdminSyncCafe()).unwrap();
      setBulkNotice(syncNotice(result));
      dispatch(requestAdminGetAllEventList({ page: 0, size: EVENTS_FETCH_ALL_SIZE }));
    } catch (err) {
      setBulkNotice(typeof err === "string" ? err : "수집에 실패했습니다. 이미 실행 중일 수 있습니다.");
    } finally {
      setSyncing(false);
    }
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

  // .unwrap() 없이 dispatch 만 하면 서버가 400/500 을 줘도 모달이 그냥 닫혀 저장 성공처럼
  // 보인다 — 성공했을 때만 모달을 닫고, 실패하면 입력값을 유지한 채 에러를 보여준다.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSubmitError(null);
    setSaving(true);
    // 날짜·시각 두 칸을 서버 필드 하나로 합치고, 화면 전용 시각 칸은 여기서 걸러 낸다 (쿠폰 화면과 같은 방식).
    const { startTime, expireTime, ...rest } = form;
    const payload = {
      ...rest,
      startAt: joinDateTime(form.startAt, startTime),
      expireAt: joinDateTime(form.expireAt, expireTime),
    };
    try {
      if (editTarget) {
        await dispatch(requestAdminUpdateExEvent({ id: editTarget.id, ...payload })).unwrap();
      } else {
        await dispatch(requestAdminInsertNewExEvent(payload)).unwrap();
      }
      closeModal();
    } catch (err) {
      setSubmitError(typeof err === "string" ? err : err?.message ?? "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
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
          <div className={styles.titleCol}>
          <div className={styles.titleRow}>
            <AdminTag variant={isEnded(e, now) ? "neutral" : "green"}>
              {isEnded(e, now) ? "종료" : "진행중"}
            </AdminTag>
            <span className={styles.title}>{e.title}</span>
          </div>
          {isCollected(e) && (
            <div className={styles.collectedRow}>
              {collectedBadges(e).map((label) => (
                <AdminTag key={label} variant="amber">{label}</AdminTag>
              ))}
              {e.contentHtml && (
                <button type="button" className={styles.miniBtn} onClick={() => setPreviewEvent(e)}>본문 미리보기</button>
              )}
              {e.sourceChanged && (
                <button type="button" className={styles.miniBtn} onClick={() => handleRefresh(e)}>본문 갱신</button>
              )}
              <button type="button" className={styles.miniBtnPrimary} onClick={() => handleApprove(e)}>승인</button>
            </div>
          )}
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
          { key: "source", label: "출처", options: sourceOptions, value: source, onChange: setSource },
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

      <button type="button" className={styles.syncBtn} onClick={handleSync} disabled={syncing}>
        {syncing ? "수집 중..." : "지금 수집"}
      </button>

      {bulkNotice && (
        <div className={styles.bulkNotice}>
          <span>{bulkNotice}</span>
          <button type="button" onClick={() => setBulkNotice(null)} aria-label="닫기">
            ×
          </button>
        </div>
      )}

      {/* 목록을 전량 받아 클라이언트에서 검색·필터·정렬하므로, 상한에 걸려 잘리면 그 값들이 전부 틀린다.
          서버 count/페이징이 없는 동안은 최소한 잘렸다는 사실을 알린다(slice 의 hasMore = 응답이 상한과 동일). */}
      {hasMore && (
        <div className={styles.bulkNotice}>
          <span>이벤트가 {EVENTS_FETCH_ALL_SIZE}건을 넘어 목록이 잘렸습니다 — 검색·필터·카운트가 정확하지 않습니다.</span>
        </div>
      )}

      {loading && events.length === 0 && <StateBox status="loading" message="불러오는 중..." />}
      {!loading && error && events.length === 0 && (
        <StateBox
          status="error"
          message={error}
          onRetry={() => dispatch(requestAdminGetAllEventList({ page: 0, size: EVENTS_FETCH_ALL_SIZE }))}
        />
      )}
      {!loading && !(error && events.length === 0) && filtered.length === 0 && (
        <StateBox status="empty" message={source === "collected" ? "수집된 초안이 없습니다" : "이벤트가 없습니다."} />
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
            {/* URL/업로드 모드 공통 — 이용자 화면 이벤트 카드(가로 배너) 비율로 실제 노출 형태를 미리 보여준다 */}
            {form.imageUrl && (
              <>
                <img className={styles.uploadPreview} src={form.imageUrl} alt="이벤트 이미지 미리보기" />
                <p className={styles.uploadPreviewCaption}>실제 화면에서는 이 비율의 배너로 노출돼요.</p>
              </>
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
            {/* 시각은 선택 입력 — 비워 두면 시작 12:00 / 종료 23:59:59 로 저장된다.
                편집 시에는 원본 시각이 채워져 있어 그대로 저장하면 시각이 바뀌지 않는다. */}
            <div className={styles.timeRow}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="00:00"
                pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
                title="24시간 형식 HH:MM (예: 23:59)"
                className={styles.input}
                name="startTime"
                value={form.startTime}
                onChange={(e) => setForm((prev) => ({ ...prev, startTime: normalizeHHMM(e.target.value) }))}
                aria-label="시작 시각"
              />
              <span className={styles.timeSep}>~</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="23:59"
                pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
                title="24시간 형식 HH:MM (예: 23:59)"
                className={styles.input}
                name="expireTime"
                value={form.expireTime}
                onChange={(e) => setForm((prev) => ({ ...prev, expireTime: normalizeHHMM(e.target.value) }))}
                aria-label="종료 시각"
              />
            </div>
            <p className={styles.uploadPreviewCaption}>
              시각을 비워 두면 시작 12:00:00 · 종료 23:59:59 로 저장돼요.
            </p>
          </div>

          <div className={styles.toggleRow}>
            <span>노출 여부</span>
            <AdminToggleSwitch
              checked={form.visible}
              onChange={(next) => setForm((prev) => ({ ...prev, visible: next }))}
              label="노출 여부"
            />
          </div>

          {submitError && <p className={styles.submitError}>{submitError}</p>}

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={closeModal}>취소</button>
            <button type="submit" className={styles.submitBtn} disabled={saving}>
              {saving ? "저장 중..." : editTarget ? "수정" : "등록"}
            </button>
          </div>
        </form>
      </AdminModal>

      {previewEvent && <EventDetailModal event={previewEvent} onClose={() => setPreviewEvent(null)} />}

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
