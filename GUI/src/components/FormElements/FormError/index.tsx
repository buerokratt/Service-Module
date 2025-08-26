import { PropsWithChildren } from 'react';
import styles from './FormError.module.scss';

interface FormErrorProps {
  style?: React.CSSProperties;
}

const FormError = ({ children, style }: PropsWithChildren<FormErrorProps>) => {
  return (
    <div className={styles.formError} style={style}>
      {children}
    </div>
  );
};

export default FormError;
