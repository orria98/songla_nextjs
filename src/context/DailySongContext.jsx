"use client";
import { createContext, useContext, useState } from "react";

const DailySongContext = createContext();

export function DailySongProvider({ children }) {
  const [songData, setSongData] = useState(null);
  const [instruments, setInstruments] = useState([]);

  return (
    <DailySongContext.Provider
      value={{ songData, setSongData, instruments, setInstruments }}
    >
      {children}
    </DailySongContext.Provider>
  );
}

export function useDailySong() {
  return useContext(DailySongContext);
}
