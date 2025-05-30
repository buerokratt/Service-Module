import { PropsWithChildren } from "react";
import styles from "./FormError.module.scss";

const FormError = ({ children }: PropsWithChildren) => {
  return <div className={styles.formError}>{children}</div>;
};

export default FormError;
