import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { MARKUP_RE, MARKUP_TEXT, MAX_LENGTH, MAX_LINES, useChatRoom } from "@/domains/chats/mobile/hooks/useChatRoom.js";
import styles from "./ChatWidget.module.scss";

const NEAR_BOTTOM_PX = 48;

const formatTime = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
};

// 키보드가 올라오면 visualViewport 가 줄어든다 — 패널을 그 안에 맞춰 입력창이 가려지지 않게 한다.
const useKeyboardInset = (open) => {
  const [inset, setInset] = useState({ bottom: 0, height: null });
  useEffect(() => {
    const vv = window.visualViewport;
    if (!open || !vv) return undefined;
    const update = () =>
      setInset({
        bottom: Math.max(0, window.innerHeight - vv.height - vv.offsetTop),
        height: vv.height,
      });
    // 열린 직후 한 번은 이벤트 없이도 필요 — 콜백으로 미뤄 effect 본문 setState 를 피한다
    const raf = requestAnimationFrame(update);
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [open]);
  return inset;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { initialized, isAuthenticated, user, login } = useAuthentication();
  const { messages, status, loading, error, notice, send } = useChatRoom(open && initialized, isAuthenticated);
  const inset = useKeyboardInset(open);
  const [text, setText] = useState("");
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const stickRef = useRef(true);

  // 입력이 길어지면 textarea 높이를 내용에 맞춤 — 상한은 SCSS max-height, 넘치면 안에서 스크롤
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const maskedNickname = isAuthenticated && String(user?.nickname ?? "").endsWith("***");
  const connected = status === "connected";
  const hasMarkup = MARKUP_RE.test(text);

  const onScroll = () => {
    const el = listRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
  };

  // 새 글이 오면 맨 아래로 — 위로 올려 읽는 중이면 유지
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stickRef.current) el.scrollTop = el.scrollHeight;
  }, [messages, open, inset.height]);

  useEffect(() => {
    if (open) stickRef.current = true;
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || body.length > MAX_LENGTH || MARKUP_RE.test(body)) return;
    if (send(body)) {
      setText("");
      stickRef.current = true;
    }
  };

  // 위치·여백은 SCSS 가 갖고, 키보드 높이만 변수로 넘긴다 (inline bottom 이 카드 여백을 덮지 않게)
  const panelStyle = open && inset.height
    ? { "--kb-inset": `${inset.bottom}px`, "--vv-height": `${inset.height}px` }
    : undefined;

  // ESC 로 접기
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const myNick = isAuthenticated ? user?.nickname : null;

  let listBody;
  if (loading && messages.length === 0) {
    listBody = <p className={styles.state} role="status">불러오는 중입니다</p>;
  } else if (error && messages.length === 0) {
    listBody = <p className={styles.stateError} role="alert">대화를 불러오지 못했어요.</p>;
  } else if (messages.length === 0) {
    listBody = <p className={styles.state}>아직 대화가 없어요. 첫 인사를 남겨보세요</p>;
  } else {
    listBody = (
      <ul className={styles.list}>
        {messages.map((m) => {
          const bot = m.senderType === "BOT";
          const mine = !bot && !!myNick && m.nickname === myNick;
          return (
            <li key={m.id} className={bot ? styles.itemBot : mine ? styles.itemMine : styles.item}>
              <span className={styles.meta}>
                {!mine && <span className={styles.nick}>{m.nickname}</span>}
                {bot && <span className={styles.botTag}>봇</span>}
                <time className={styles.time}>{formatTime(m.createdAt)}</time>
              </span>
              {/* 텍스트 노드로만 렌더 — HTML 해석·링크 자동연결 없음 (REQ-CHAT-13) */}
              <span className={styles.body}>{m.body}</span>
            </li>
          );
        })}
      </ul>
    );
  }

  let footer;
  if (!isAuthenticated) {
    footer = (
      <div className={styles.gate}>
        <p className={styles.gateText}>로그인하면 채팅할 수 있어요</p>
        <button type="button" className={styles.gateBtn} onClick={login}>로그인</button>
      </div>
    );
  } else if (maskedNickname) {
    footer = (
      <div className={styles.gate}>
        <p className={styles.gateText}>닉네임을 바꾸면 채팅할 수 있어요</p>
        <button type="button" className={styles.gateBtn} onClick={() => { setOpen(false); navigate(ROUTE_PATHS.mypage); }}>
          닉네임 변경
        </button>
      </div>
    );
  } else {
    footer = (
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.field}>
        <textarea
          ref={inputRef}
          className={styles.input}
          rows={1}
          value={text}
          onChange={(e) => {
            // 6번째 줄은 입력 자체를 막는다 (붙여넣기 포함 — 앞 5줄만 남김)
            const lines = e.target.value.split("\n");
            setText(lines.slice(0, MAX_LINES).join("\n").slice(0, MAX_LENGTH));
          }}
          onKeyDown={(e) => {
            // Enter 전송 · Shift+Enter 줄바꿈. 한글 조합 중 Enter 는 글자 확정이라 보내지 않는다
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) submit(e);
          }}
          placeholder={connected ? "메시지를 입력하세요" : "연결 중이에요"}
          disabled={!connected}
          maxLength={MAX_LENGTH}
          aria-label="펀톡 메시지"
        />
        <span className={text.length >= MAX_LENGTH ? styles.counterMax : styles.counter} aria-hidden="true">{text.length}/{MAX_LENGTH}</span>
        </div>
        <button type="submit" className={styles.sendBtn} disabled={!connected || !text.trim() || hasMarkup}>전송</button>
      </form>
    );
  }

  return (
    <>
      {!open && (
        <button type="button" className={styles.fab} onClick={() => setOpen(true)} aria-label="펀톡 열기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path transform="translate(2 2.99)" d="M5.9 17.008C7.809 17.987 10.004 18.252 12.091 17.756C14.178 17.259 16.019 16.034 17.282 14.3C18.545 12.566 19.147 10.439 18.981 8.3C18.814 6.161 17.889 4.153 16.372 2.636C14.855 1.119 12.846 0.194 10.708 0.027C8.569-0.14 6.441 0.463 4.708 1.726C2.974 2.989 1.749 4.83 1.252 6.917C0.756 9.004 1.021 11.199 2 13.108L0 19.008L5.9 17.008Z" /></svg>
        </button>
      )}
      {open && <div className={styles.scrim} onClick={() => setOpen(false)} aria-hidden="true" />}
      {open && (
        <section className={styles.panel} style={panelStyle} aria-label="펀톡">
          <div className={styles.head}>
            <strong className={styles.title}>펀톡</strong>
            <button type="button" className={styles.close} onClick={() => setOpen(false)} aria-label="펀톡 닫기">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9L12 15L18 9" /></svg>
            </button>
          </div>
          <p className={styles.notice}>펀톡은 최근 100개만 잠시 보관돼요</p>
          {status !== "connected" && (
            <p className={styles.conn} role="status">
              {status === "connecting" ? "연결 중…" : "연결이 끊겼어요. 다시 연결 중…"}
            </p>
          )}
          <div className={styles.listWrap} ref={listRef} onScroll={onScroll}>{listBody}</div>
          {(hasMarkup || notice) && <p className={styles.toast} role="alert">{hasMarkup ? MARKUP_TEXT : notice}</p>}
          {footer}
        </section>
      )}
    </>
  );
}
