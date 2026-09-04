import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import AdminSegmented from "@/global/ui/admin/fields/AdminSegmented.jsx";
import AdminToggleSwitch from "@/global/ui/admin/toggle/AdminToggleSwitch.jsx";
import AdminStateBox from "@/global/ui/admin/stateBox/AdminStateBox.jsx";
import RichEditor from "@/global/ui/richEditor/RichEditor.jsx";
import { requestUploadImage } from "@/infra/api/uploads/index.js";
import {
  requestAdminGetNotice,
  requestAdminInsertNotice,
  requestAdminUpdateNotice,
} from "@/domains/notices/store/admin/thunks.js";
import styles from "./AdminNoticeWriteScreen.module.scss";

// 셸 탭이 아니라 전체 페이지로 전환되는 공지 글쓰기 화면(핸드오프 § 6 — 유일한 예외).
// 에디터 본체(Tiptap 래퍼)는 도메인 비의존 공용 컴포넌트(RichEditor)로 분리해 두었다 —
// README 가 "커뮤니티 게시판 글쓰기에 재사용" 을 명시했기 때문에 공지 전용 로직(이 화면)과
// 범용 에디터를 분리했다. 이미지 업로드는 /api/upload/events 엔드포인트를 그대로 쓴다
// (경로 이름은 이벤트지만 실제로는 범용 이미지 업로드 — UploadController 실측 확인).
const SOURCE_OPTIONS = [
  { value: "INTERNAL", label: "사이트 공지" },
  { value: "EXTERNAL", label: "공식 공지 링크" },
];

const EMPTY_FORM = {
  title: "",
  content: "",
  externalUrl: "",
  imageUrl: "",
  source: "INTERNAL",
  isVisible: true,
  isPinned: false,
};

const formOf = (notice) => ({
  title: notice.title ?? "",
  content: notice.content ?? "",
  externalUrl: notice.externalUrl ?? "",
  imageUrl: notice.imageUrl ?? "",
  source: notice.source ?? "INTERNAL",
  isVisible: notice.isVisible ?? true,
  isPinned: notice.isPinned ?? false,
});

const stripHtml = (html) => (html ?? "").replace(/<[^>]*>/g, "").trim();
const firstImageOf = (html) => html?.match(/<img[^>]+src="([^"]+)"/)?.[1] ?? "";

// 업로드 응답 형태가 raw string / { url, fileName } / 래핑된 { data: {...} } 중 무엇이 오든
// URL 을 뽑아낸다(AdminEventScreen 과 동일 패턴).
const extractUploadedUrl = (result) => {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    if (typeof result.url === "string") return result.url;
    if (result.data) return extractUploadedUrl(result.data);
  }
  return null;
};

export default function AdminNoticeWriteScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = id != null;

  const { siteNotices, error } = useSelector((s) => s.notices);
  const existing = useMemo(
    () => (isEdit ? siteNotices.find((n) => String(n.id) === String(id)) : null),
    [isEdit, siteNotices, id],
  );

  const [form, setForm] = useState(EMPTY_FORM);
  const [hydrated, setHydrated] = useState(!isEdit);
  const [coverUploading, setCoverUploading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // 수정 모드: 목록 store 에 이미 있으면 그대로 쓰고, 없으면(새로고침·직접 진입) 단건 조회로 보강.
  useEffect(() => {
    if (!isEdit) return;
    if (existing) {
      setForm(formOf(existing));
      setHydrated(true);
      return;
    }
    dispatch(requestAdminGetNotice(id))
      .unwrap()
      .then((notice) => {
        setForm(formOf(notice));
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
  }, [isEdit, id, existing, dispatch]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const goList = () => navigate(ROUTE_PATHS.admin_tab("notice"));

  const savingRef = useRef(false);
  const handleSaveRef = useRef(() => {});
  handleSaveRef.current = async () => {
    if (savingRef.current) return;
    setSubmitError(null);

    if (!form.title.trim()) {
      setSubmitError("제목을 입력해주세요.");
      return;
    }
    if (form.source === "INTERNAL" && !stripHtml(form.content)) {
      setSubmitError("본문을 입력해주세요.");
      return;
    }
    if (form.source === "EXTERNAL" && !form.externalUrl.trim()) {
      setSubmitError("외부 링크를 입력해주세요.");
      return;
    }

    // DB CHECK 제약(chk_site_notices_source_payload) 미러링: source 별 content/externalUrl 배타.
    const payload =
      form.source === "EXTERNAL"
        ? { ...form, content: null }
        : { ...form, externalUrl: null };

    savingRef.current = true;
    try {
      if (isEdit) {
        await dispatch(requestAdminUpdateNotice({ id, ...payload })).unwrap();
      } else {
        await dispatch(requestAdminInsertNotice(payload)).unwrap();
      }
      goList();
    } catch (err) {
      setSubmitError(typeof err === "string" ? err : err?.message ?? "저장에 실패했습니다.");
    } finally {
      savingRef.current = false;
    }
  };

  // useSetTopBar 는 마운트 시 1회만 설정된다 — rightAction 버튼은 고정 엘리먼트로 두고
  // 클릭 시 항상 최신 저장 로직(handleSaveRef.current)을 참조하게 해 stale closure 를 피한다.
  useSetTopBar({
    variant: "page",
    title: isEdit ? "글 수정" : "글쓰기",
    onBack: goList,
    rightAction: (
      <button
        type="button"
        className={styles.saveBtn}
        onClick={() => handleSaveRef.current()}
      >
        {isEdit ? "수정" : "등록"}
      </button>
    ),
  });

  const handleCoverFileSelect = async (file) => {
    setCoverUploading(true);
    try {
      const result = await dispatch(requestUploadImage({ file, directory: "events" })).unwrap();
      const url = extractUploadedUrl(result);
      if (url) setField("imageUrl", url);
    } catch {
      setSubmitError("대표 이미지 업로드에 실패했습니다.");
    } finally {
      setCoverUploading(false);
    }
  };

  const handleUseFirstContentImage = () => {
    const url = firstImageOf(form.content);
    if (url) setField("imageUrl", url);
  };

  const handleEditorImageUpload = async (file) => {
    const result = await dispatch(requestUploadImage({ file, directory: "events" })).unwrap();
    return extractUploadedUrl(result);
  };

  if (isEdit && !hydrated) {
    return (
      <div className={styles.page}>
        <AdminStateBox status="loading" />
      </div>
    );
  }

  if (isEdit && hydrated && !existing && error) {
    return (
      <div className={styles.page}>
        <AdminStateBox
          status="error"
          message={error}
          onRetry={() => {
            setHydrated(false);
            dispatch(requestAdminGetNotice(id))
              .unwrap()
              .then((notice) => setForm(formOf(notice)))
              .finally(() => setHydrated(true));
          }}
        />
      </div>
    );
  }

  if (isEdit && hydrated && !existing && !error) {
    return (
      <div className={styles.page}>
        <AdminStateBox status="empty" message="공지를 찾을 수 없습니다." />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.boardRow}>
        <AdminSegmented
          name="공지 구분"
          options={SOURCE_OPTIONS}
          value={form.source}
          onChange={(v) => setField("source", v)}
        />
      </div>

      <input
        className={styles.titleInput}
        value={form.title}
        onChange={(e) => setField("title", e.target.value)}
        placeholder="제목을 입력하세요"
      />

      <div className={styles.coverRow}>
        <div className={styles.coverThumb}>
          {form.imageUrl ? (
            <img src={form.imageUrl} alt="대표 이미지 미리보기" />
          ) : (
            <span>미리보기{"\n"}이미지</span>
          )}
        </div>
        <div className={styles.coverInfo}>
          <span className={styles.coverLabel}>대표(미리보기) 이미지</span>
          <span className={styles.coverDesc}>목록·공유 카드에 노출 · 권장 1200×630</span>
          <div className={styles.coverActions}>
            <label className={styles.coverBtn}>
              {coverUploading ? "업로드 중..." : "파일 선택"}
              <input
                type="file"
                accept="image/*"
                className={styles.hiddenFileInput}
                disabled={coverUploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) handleCoverFileSelect(file);
                }}
              />
            </label>
            <button type="button" className={styles.coverBtnGhost} onClick={handleUseFirstContentImage}>
              본문 첫 이미지 사용
            </button>
          </div>
        </div>
      </div>

      {form.source === "INTERNAL" ? (
        <div className={styles.editorBox}>
          <RichEditor
            value={form.content}
            onChange={(html) => setField("content", html)}
            onUploadImage={handleEditorImageUpload}
          />
        </div>
      ) : (
        <label className={styles.externalLabel}>
          외부 링크
          <input
            className={styles.externalInput}
            type="url"
            placeholder="https://..."
            value={form.externalUrl}
            onChange={(e) => setField("externalUrl", e.target.value)}
          />
        </label>
      )}

      {submitError && <p className={styles.submitError}>{submitError}</p>}

      <div className={styles.bottomBar}>
        <div className={styles.bottomToggles}>
          <span className={styles.toggleItem}>
            노출
            <AdminToggleSwitch
              checked={form.isVisible}
              onChange={(next) => setField("isVisible", next)}
              label="노출 여부"
            />
          </span>
          <span className={styles.toggleItem}>
            상단 고정
            <AdminToggleSwitch
              checked={form.isPinned}
              onChange={(next) => setField("isPinned", next)}
              label="상단 고정 여부"
            />
          </span>
        </div>
        <span className={styles.charCount}>
          {form.source === "INTERNAL" ? `${stripHtml(form.content).length}자` : ""}
        </span>
      </div>
    </div>
  );
}
