import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useTestServiceStore from 'store/test-services.store';

import styles from './chat.module.scss';
import Send from '../../static/icons/send.svg';

const ChatInput = (): React.JSX.Element => {
  const [userInput, setUserInput] = useState<string>('');
  const { t } = useTranslation();

  const testService = (): void => {
    useTestServiceStore.getState().sendUserInput(userInput);
    setUserInput('');
  };

  return (
    <div className={styles.keypadContainer}>
      <div className={styles.keypad}>
        <span className={styles.label}>{t('chat.service-input')}:</span>
        <input
          className={styles.input}
          value={userInput}
          placeholder={t('chat.input-placeholder') ?? ''}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && userInput.trim()) {
              event.preventDefault();
              testService();
            }
          }}
        />
        <button onClick={testService} className={styles.button} disabled={!userInput.trim()}>
          <img src={Send} alt="Send" />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
