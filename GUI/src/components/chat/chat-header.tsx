import React from 'react';
import { useTranslation } from 'react-i18next';
import useTestServiceStore from 'store/test-services.store';

import styles from './chat.module.scss';
import Close from '../../static/icons/close.svg';

const ChatHeader = (): React.JSX.Element => {
  const { t } = useTranslation();

  return (
    <div className={styles.header}>
      <div className={styles.title}>{t('chat.title')}</div>
      <div className={styles.actions}>
        <button onClick={useTestServiceStore.getState().closeChat}>
          <img src={Close} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
