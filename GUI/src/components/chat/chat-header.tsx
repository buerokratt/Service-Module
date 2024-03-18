import { useTranslation } from 'react-i18next';
import Close from '../../static/icons/close.svg';
import styles from './chat.module.scss';
import useTestServiceStore from 'store/test-services.store';

const ChatHeader = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className={styles.header}>
      <div className={styles.title}>
        {t('widget.title')}
      </div>
      <div className={styles.actions}>
        <button
          title={t('header.button.close.label') ?? ''}
          onClick={useTestServiceStore.getState().closeChat}
        >
          <img src={Close} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
