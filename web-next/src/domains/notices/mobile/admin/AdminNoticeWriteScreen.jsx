"use client";
import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { ROUTE_PATHS } from "@/config/routePath.js";
import AdminSegmented from "@/global/ui/admin/fields/AdminSegmented.jsx";
import AdminToggleSwitch from "@/global/ui/admin/toggle/AdminToggleSwitch.jsx";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import { stripHtml } from "@/domains/notices/mobile/admin/stripHtml.js";

// Tiptap 은 이 화면에서만 로드한다 — 다른 페이지 번들에 실리지 않도록 지연 로드(서버 렌더 제외).
const RichEditor = dynamic(() => import("@/global/ui/richEditor/RichEditor.jsx"), {
  ssr: false,
  loading: () => <StateBox status="loading" message="에디터를 불러오는 중..." compact />,
});
// 목록(AdminNoticeScreen)과 같은 v2 강조 퍼플 토큰(--color-admin-accent 등)을 쓰기 위한 side-effect
// import — 이 화면은 셸 밖 독립 라우트라 AdminShellScreen 의 :root 주입을 상속받지 못한다.
import "@/global/ui/admin/admin.tokens.scss";
import { extractUploadedUrl, useUploadImageMutation } from "@/infra/api/uploads/queries.js";
import { useAdminNoticeCreate, useAdminNoticeDetail, useAdminNoticeUpdate } from "@/domains/notices/store/admin/queries.js";
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

const firstImageOf = (html) => html?.match(/<img[^>]+src="([^"]+)"/)?.[1] ?? "";

export default function AdminNoticeWriteScreen() {
  const router = useRouter();
  const { id } = useParams();
  const isEdit = id != null;

  const detail = useAdminNoticeDetail(id, isEdit);
  const createNotice = useAdminNoticeCreate();
  const updateNotice = useAdminNoticeUpdate();
  const uploadImage = useUploadImageMutation();
  const existing = detail.data ?? null;
  const detailError = detail.error?.message ?? null;

  const [form, setForm] = useState(EMPTY_FORM);
  const [hydrated, setHydrated] = useState(!isEdit);
  const [coverUploading, setCoverUploading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // 수정 모드: 단건을 읽어 폼을 한 번만 채운다(채운 뒤의 재조회가 입력 중인 값을 덮어쓰지 않게).
  if (isEdit && existing && !hydrated) {
    setForm(formOf(existing));
    setHydrated(true);
  }

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const goList = () => router.push(ROUTE_PATHS.admin_tab("notice"));

  const savingRef = useRef(false);
  const handleSave = async () => {
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
        await updateNotice.mutateAsync({ id, ...payload });
      } else {
        await createNotice.mutateAsync(payload);
      }
      goList();
    } catch (err) {
      setSubmitError(err?.message ?? "저장에 실패했습니다.");
    } finally {
      savingRef.current = false;
    }
  };

  const handleCoverFileSelect = async (file) => {
    setCoverUploading(true);
    try {
      const result = await uploadImage.mutateAsync({ file, directory: "events" });
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
    const result = await uploadImage.mutateAsync({ file, directory: "events" });
    return extractUploadedUrl(result);
  };

  if (isEdit && !hydrated) {
    return (
      <div className={styles.page}>
        {detailError ? (
          <StateBox status="error" message={detailError} onRetry={() => detail.refetch()} />
        ) : detail.isPending ? (
          <StateBox status="loading" message="불러오는 중..." />
        ) : (
          <StateBox status="empty" message="공지를 찾을 수 없습니다." />
        )}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* 글로벌 상단바에는 뒤로가기·저장 자리가 없어 화면 안에 둔다 */}
      <div className={styles.actionBar}>
        <button type="button" className={styles.backBtn} onClick={goList}>
          ← 목록
        </button>
        <button type="button" className={styles.saveBtn} onClick={handleSave}>
          {isEdit ? "수정" : "등록"}
        </button>
      </div>
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
