"use client";

import { getLast7Songs } from "@/lib/api";
import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { use } from "react";
import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";

const HistoryPage = () => {
  const [last7Songs, setLast7Songs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchLast7Songs = async () => {
      try {
        const songs = await getLast7Songs();
        setLast7Songs(songs);
      } catch (error) {
        console.error("Failed to fetch last 7 songs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLast7Songs();
  }, []);

  function formatDate(dateString) {
    const months = [
      "janúar",
      "febrúar",
      "mars",
      "apríl",
      "maí",
      "júní",
      "júlí",
      "ágúst",
      "september",
      "október",
      "nóvember",
      "desember",
    ];

    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day}. ${month} ${year}`;
  }

  const handleOnSongClick = async (songId) => {
    router.push(`/history/${songId}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Söngla</h1>
      </header>
      <main className={styles.main}>
        <div className={styles.ctas}>
          <section>
            <div className={styles.cards}>
              {last7Songs.length === 0 ? (
                <p>Engin lög fundust.</p>
              ) : (
                last7Songs.map((song) => (
                  <div
                    key={song._id}
                    className={styles.card}
                    onClick={() => handleOnSongClick(song._id)}
                  >
                    <div className={styles.cardDetails}>
                      <h2>{formatDate(song.date)}</h2>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
};

export default HistoryPage;
