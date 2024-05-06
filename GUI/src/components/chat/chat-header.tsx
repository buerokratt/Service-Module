import { useTranslation } from 'react-i18next';
import Close from '../../static/icons/close.svg';
import Reset from '../../static/icons/reset.svg';
import styles from './chat.module.scss';
import useTestServiceStore from 'store/test-services.store';

const ChatHeader = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className={styles.header}>
      <div className={styles.title}>
        {t('chat.title')}
      </div>
      <div className={styles.actions}>
        <button onClick={useTestServiceStore.getState().restart}>
          <img src={Reset} alt='Reset'/>
        </button>
        <button onClick={useTestServiceStore.getState().closeChat}>
          <img src={Close} alt='Close'/>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
