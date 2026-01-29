import styles from "./AdminCouponManagePage.module.scss";

const AdminCouponManagePage = () => {
  return (
    <div className={styles.wrapper}>
      <button className={styles.create}>쿠폰 생성</button>

      <table className={styles.table}>
        <thead>
        <tr>
          <th>코드</th>
          <th>이름</th>
          <th>사용량</th>
          <th>만료일</th>
          <th>상태</th>
          <th>액션</th>
        </tr>
        </thead>
        <tbody>
        {MOCK_COUPONS.map(c => (
          <tr key={c.code}>
            <td>{c.code}</td>
            <td>{c.name}</td>
            <td>{c.used}/{c.limit}</td>
            <td>{c.expiredAt}</td>
            <td>{c.status}</td>
            <td>
              <button>수정</button>
              <button className={styles.danger}>중단</button>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCouponManagePage;
