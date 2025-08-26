"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const handleDailyClick = () => {
    router.push("/daily");
  };
  const handleHistoryClick = () => {
    router.push("/history");
  };
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Söngla</h1>
        <Link href="/login">About</Link>
        <Link href="/admin">Admin</Link>
      </header>
      <main className={styles.main}>
        <div className={styles.ctas}>
          <section>
            <div className={styles.cards}>
              <div className={styles.card} onClick={handleDailyClick}>
                <div className={styles.cardDetails}>
                  <h2>Lag dagsins</h2>
                </div>
              </div>
              <div className={styles.card} onClick={handleHistoryClick}>
                <div className={styles.cardDetails}>
                  <h2>Lög síðustu 7 daga</h2>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardDetails}>
                  <h2>Þín tölfræði</h2>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
