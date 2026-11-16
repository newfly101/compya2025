import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import styles from "./RichEditor.module.scss";

// 도메인 비의존 Tiptap 래퍼.
// 어드민 공지 글쓰기에서 최초 사용하지만, 핸드오프(§ 6)가 "커뮤니티 게시판 글쓰기에
// 재사용" 을 명시해 처음부터 공용 위치(web/src/global/ui/richEditor/)에 둔다.
// 공지/커뮤니티 등 도메인 로직(저장 API·필드)은 이 컴포넌트에 넣지 않는다 — HTML 문자열을
// value/onChange 로만 주고받는 순수 에디터다.
//
// onUploadImage(file) => Promise<url> 를 넘기면 이미지 버튼이 파일 선택 → 업로드 → 삽입까지 처리한다.
// 넘기지 않으면 이미지 버튼은 비활성화된다.
// [주의] value 는 최초 마운트 시 초기 콘텐츠로만 쓰인다(비제어 — uncontrolled).
// 호출부가 로딩이 끝난 뒤에만 이 컴포넌트를 마운트해야 한다(AdminNoticeWriteScreen 이
// 수정 모드에서 데이터 로딩(hydrated) 완료 전에는 이 컴포넌트를 렌더하지 않는 이유).
// 마운트 후 value 를 바꿔도 내부 콘텐츠는 재동기화되지 않는다 — 타이핑 중 매 keystroke 마다
// setContent 를 호출하면 커서 위치가 튀는 문제를 피하기 위함이다.
export default function RichEditor({ value, onChange, onUploadImage, disabled = false }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false, HTMLAttributes: { class: styles.contentImage } }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor: ed }) => onChange?.(ed.getHTML()),
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) return null;

  const run = (fn) => (e) => {
    e.preventDefault();
    fn();
    editor.chain().focus().run();
  };

  const handleLink = () => {
    const prev = editor.getAttributes("link").href;
    const url = window.prompt("링크 URL을 입력하세요", prev || "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !onUploadImage) return;
    try {
      const url = await onUploadImage(file);
      if (url) editor.chain().focus().setImage({ src: url }).run();
    } catch {
      // 업로드 실패는 호출부(화면)가 별도 안내를 책임진다 — 에디터는 조용히 무시.
    }
  };

  const TOOLS = [
    { key: "bold", label: "B", title: "굵게", active: "bold", run: () => editor.chain().focus().toggleBold().run() },
    { key: "italic", label: "I", title: "기울임", active: "italic", run: () => editor.chain().focus().toggleItalic().run() },
    { key: "underline", label: "U", title: "밑줄", active: "underline", run: () => editor.chain().focus().toggleUnderline().run() },
    { key: "strike", label: "S", title: "취소선", active: "strike", run: () => editor.chain().focus().toggleStrike().run() },
    { key: "heading", label: "H", title: "제목", active: "heading", activeAttr: { level: 3 }, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { key: "bulletList", label: "•", title: "목록", active: "bulletList", run: () => editor.chain().focus().toggleBulletList().run() },
    { key: "orderedList", label: "1.", title: "번호 목록", active: "orderedList", run: () => editor.chain().focus().toggleOrderedList().run() },
    { key: "blockquote", label: "❝", title: "인용", active: "blockquote", run: () => editor.chain().focus().toggleBlockquote().run() },
    { key: "link", label: "링크", title: "링크", active: "link", run: handleLink },
    { key: "image", label: "이미지", title: "이미지 삽입", isImagePicker: true },
    { key: "hr", label: "—", title: "구분선", run: () => editor.chain().focus().setHorizontalRule().run() },
    { key: "undo", label: "↺", title: "실행 취소", run: () => editor.chain().focus().undo().run() },
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar} role="toolbar" aria-label="서식 도구">
        {TOOLS.map((t) =>
          t.isImagePicker ? (
            // ref.current 대신 label + hidden input 클릭 위임 패턴(AdminFilePicker 와 동일 기법) —
            // 파일 선택 트리거를 위해 imperative ref 를 쓰지 않는다.
            <label
              key={t.key}
              title={t.title}
              aria-label={t.title}
              className={`${styles.toolBtn} ${styles.toolBtnLabel} ${!onUploadImage ? styles.toolBtnDisabled : ""}`}
            >
              {t.label}
              <input
                type="file"
                accept="image/*"
                className={styles.hiddenFileInput}
                disabled={!onUploadImage}
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <button
              key={t.key}
              type="button"
              title={t.title}
              aria-label={t.title}
              className={styles.toolBtn}
              aria-pressed={t.active ? editor.isActive(t.active, t.activeAttr) : undefined}
              onClick={run(t.run)}
            >
              {t.label}
            </button>
          ),
        )}
      </div>
      <EditorContent editor={editor} className={styles.content} />
    </div>
  );
}
