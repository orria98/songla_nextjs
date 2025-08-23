import { useState, useEffect } from "react";
import { getAllSongs } from "@/lib/api";
import styles from "./GuessSongStyle.module.css";
import MyAutocomplete from "../autocomplete/MyAutocomplete";

const GuessSongModal = ({ onClose, onSelect }) => {
  const [songs, setSongs] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const allSongs = await getAllSongs();
        console.log("Fetched songs:", allSongs);
        setSongs(allSongs || []);
      } catch (error) {
        console.error("Failed to fetch songs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={onClose} className={styles.closeButton}>
          ✕
        </button>

        <h2>Giskaðu á lag dagsins</h2>
        <MyAutocomplete
          options={songs}
          label="Veldu lag"
          onSelect={setSelectedSong}
        />
        <button className={styles.button}>Staðfesta</button>
      </div>
    </div>
  );
};

export default GuessSongModal;
