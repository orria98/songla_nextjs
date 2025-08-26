"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import styles from "./page.module.css";
import { postDailySong } from "@/lib/api";
import { useDailySong } from "@/context/DailySongContext";

const AdminPage = () => {
  const { data: session } = useSession();
  const { instruments, setInstruments } = useDailySong();
  // List of available images in public/img
  const instrumentImages = [
    "drum.png",
    "guitar-instrument.png",
    "electric-guitar.png",
    "violin.png",
    "bass-guitar.png",
    "microphone.png",
    "piano.png",
    "vst.png",
    "horn.png",
  ];

  const confirmInstruments = async () => {
    const uploadedInstruments = await Promise.all(
      instruments.map(async (instrument) => {
        if (instrument.audio) {
          const formData = new FormData();
          formData.append("file", instrument.audio);
          formData.append(
            "upload_preset",
            process.env.NEXT_PUBLIC_CLOUDINARY_PRESET
          );

          console.log(
            "cloud name ",
            process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
          );
          console.log(
            "upload preset ",
            process.env.NEXT_PUBLIC_CLOUDINARY_PRESET
          );

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          if (!res.ok) {
            const err = await res.json();
            console.error("Cloudinary error:", err);
            throw new Error("Upload failed");
          }

          const data = await res.json();
          console.log("Cloudinary response:", data);
          return {
            ...instrument,
            audioUrl: data.secure_url,
            audio: null,
          };
        }
        return instrument;
      })
    );

    setInstruments(uploadedInstruments);
  };

  const handleRemoveInstrument = (index) => {
    setInstruments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const songData = {
      date: e.target[0].value,
      title: e.target[1].value,
      artist: e.target[2].value,
      releaseYear: Number(e.target[3].value),
      spotifyPlays: Number(e.target[4].value),
      hint: e.target[5].value,
      difficulty: e.target[6].value,
      instruments: instruments.map((inst) => ({
        name: inst.name,
        image: inst.image,
        audioUrl: inst.audioUrl,
      })),
    };
    console.log("Song data: ", songData);
    console.log("User access token: ", session.user.accessToken);
    const res = await postDailySong(songData, session.user.accessToken);
    if (res.ok) {
      console.log("Song added successfully");
    } else {
      console.error("Failed to add song", res);
    }
  };

  const [currentInstrument, setCurrentInstrument] = useState({
    name: "",
    image: "",
    audio: null,
  });

  if (!session) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Admin Page</h1>
        </header>
        <div className={styles.ctas}>
          <div className={styles.container}>
            <p>You must be logged in to view this page.</p>
            <button className={styles.button} onClick={() => signIn()}>
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Admin Page</h1>
        <button className={styles.button} onClick={() => signOut()}>
          Sign Out
        </button>
      </header>
      <main className={styles.main}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.ctasWrapper}>
            <div className={styles.ctas}>
              <input className={styles.input} type="date" placeholder="Date" />
              <input
                className={styles.input}
                type="text"
                placeholder="Song Title"
              />
              <input
                className={styles.input}
                type="text"
                placeholder="Artist"
              />
              <input
                className={styles.input}
                type="number"
                placeholder="Release Year"
              />
              <input
                className={styles.input}
                type="number"
                placeholder="Spotify Plays"
              />
              <input className={styles.input} type="text" placeholder="Hint" />
              <input
                className={styles.input}
                type="text"
                placeholder="Difficulty"
              />
              {/* Instrument input fields */}
              <input
                className={styles.input}
                type="text"
                placeholder="Instrument Name"
                value={currentInstrument.name}
                onChange={(e) =>
                  setCurrentInstrument({
                    ...currentInstrument,
                    name: e.target.value,
                  })
                }
              />
              <select
                className={styles.input}
                value={currentInstrument.image}
                onChange={(e) =>
                  setCurrentInstrument({
                    ...currentInstrument,
                    image: e.target.value,
                  })
                }
              >
                <option value="">Select image</option>
                {instrumentImages.map((img) => (
                  <option key={img} value={img}>
                    {img}
                  </option>
                ))}
              </select>
              {currentInstrument.image && (
                <img
                  src={`/img/${currentInstrument.image}`}
                  alt="preview"
                  style={{ width: 40, height: 40, objectFit: "contain" }}
                />
              )}
              <input
                className={styles.fileInput}
                type="file"
                accept="audio/*"
                onChange={(e) =>
                  setCurrentInstrument({
                    ...currentInstrument,
                    audio: e.target.files[0],
                  })
                }
              />
              <button
                type="button"
                className={styles.button}
                onClick={() => {
                  if (!currentInstrument.name) return;
                  setInstruments([...instruments, currentInstrument]);
                  setCurrentInstrument({ name: "", image: "", audio: null });
                }}
              >
                Add Instrument
              </button>
              <button className={styles.button} type="submit">
                Add Song
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={confirmInstruments}
              >
                Confirm Instruments
              </button>
              <button
                type="button"
                className={styles.button}
                onClick={console.log(instruments)}
              >
                Log added instruments
              </button>
            </div>
            <div className={styles.cards}>
              {instruments.map((instrument, index) => (
                <div className={styles.card} key={index}>
                  <div className={styles.cardDetails}>
                    <div>
                      <strong>{instrument.name}</strong>
                    </div>
                    {instrument.image && (
                      <img
                        src={`/img/${instrument.image}`}
                        alt="preview"
                        style={{ width: 40, height: 40, objectFit: "contain" }}
                      />
                    )}
                    {instrument.audio && (
                      <div>
                        <audio
                          controls
                          src={URL.createObjectURL(instrument.audio)}
                          style={{ marginLeft: 8 }}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}
                    <button
                      className={styles.button}
                      onClick={() => handleRemoveInstrument(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminPage;
