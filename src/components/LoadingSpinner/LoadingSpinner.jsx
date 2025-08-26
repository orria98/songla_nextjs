import styles from "./loading.module.css";

const LoadingSpinner = () => {
  return (
    <div className={styles.spinnerContainer}>
      <span className={styles.loader}></span>
    </div>
  );
};

export default LoadingSpinner;
