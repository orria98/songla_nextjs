import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useState, useEffect } from "react";
import { getAllSongs } from "@/lib/api";
import styles from "./style.module.css";

export default function MyAutocomplete({ options, label, onSelect }) {
  return (
    <Autocomplete
      options={options}
      onChange={(event, value) => onSelect(value)}
      renderInput={(params) => (
        <TextField {...params} label={label} variant="outlined" />
      )}
      className={styles.autoComplete}
    />
  );
}
