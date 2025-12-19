import styles from "@/styles/pages/FunNoticePage.module.scss";
import { useParams } from "react-router-dom";
import funNotice from "@/data/FunNotice.js";

const FunNoticePage = () => {
  const {id} = useParams();

  const data = funNotice.find(item => item.id === Number(id));

  if(!data) return <>공지사항을 찾을 수 없습니다.</>;
  console.log("data get!!! :\n",data);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.category}>{data.category}</span>
        <h1 className={styles.title}>{data.titleName}</h1>

        <div className={styles.meta}>
          <span>{data.updateDate}</span>
          {data.version && <span>{data.version}</span>}
        </div>
      </header>

      {data.summary && (
        <section className={styles.summary}>
          <ul>
            {data.summary.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.body}>
        <ol>
          {data.contents.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      </section>

      <footer className={styles.footer}>
        <p>앞으로도 지속적으로 정확하고 편리한 기능을 제공하겠습니다.</p>
        <p>감사합니다.</p>
      </footer>
    </main>
  );
}

export default FunNoticePage;
