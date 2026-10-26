import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { requestGetAdminChatOnline } from "@/domains/chats/store/admin/thunks.js";
import styles from "./PresenceModal.module.scss";

// 관리자 전용 접속 목록 — 패널 안쪽을 덮는 레이어. 열려 있는 동안 tick(PRESENCE 수신)마다 다시 불러온다.
export default function PresenceModal({ tick, onClose }) {
  const dispatch = useDispatch();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    dispatch(requestGetAdminChatOnline()).unwrap()
      .then((res) => { if (alive) { setData(res); setFailed(false); } })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [dispatch, tick]);

  const users = data?.users ?? [];
  const guests = data?.guests ?? [];
  const anon = data?.anonymousCount ?? 0;

  let body;
  if (failed && !data) {
    body = <p className={styles.stateError} role="alert">접속 목록을 불러오지 못했어요.</p>;
  } else if (!data) {
    body = <p className={styles.state} role="status">불러오는 중입니다</p>;
  } else if (users.length + guests.length + anon === 0) {
    body = <p className={styles.state}>접속 중인 사람이 없어요</p>;
  } else {
    body = (
      <>
        <h4 className={styles.sub}>로그인 사용자 {users.length}명</h4>
        <ul className={styles.list}>
          {users.map((u) => (
            <li key={u.userId} className={styles.row}>
              <span className={styles.who}>
                {u.nicknameSet ? (
                  <span className={styles.name}>{u.nickname}</span>
                ) : (
                  <span className={styles.badge}>닉네임 미설정</span>
                )}
                <span className={styles.level}>Lv.{u.level}</span>
                {u.title && <span className={styles.badge}>{u.title}</span>}
              </span>
              <span className={styles.id}>#{u.userId}</span>
            </li>
          ))}
        </ul>
        <h4 className={styles.sub}>게스트 {guests.length}명</h4>
        <ul className={styles.list}>
          {guests.map((g) => <li key={g} className={styles.row}><span className={styles.name}>{g}</span></li>)}
        </ul>
        <p className={styles.anon}>번호 없는 게스트 {anon}명</p>
      </>
    );
  }

  return (
    <div className={styles.layer} role="dialog" aria-modal="true" aria-label="접속 목록">
      <div className={styles.head}>
        <strong className={styles.title}>접속 목록</strong>
        <button type="button" className={styles.close} onClick={onClose} aria-label="접속 목록 닫기">×</button>
      </div>
      <div className={styles.content}>{body}</div>
    </div>
  );
}
