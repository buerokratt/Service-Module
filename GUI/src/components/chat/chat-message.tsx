import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { TestingMessage } from 'store/test-services.store';

import BotMessage from './bot-message';
import styles from './chat.module.scss';
import UserMessage from './user-message';

interface ChatMessageProps {
  message: TestingMessage;
}

const ChatMessage = ({ message }: ChatMessageProps): React.JSX.Element => {
  const { t } = useTranslation();

  if (message.author === 'enduser') {
    return <UserMessage message={message} />;
  }

  if (message.author === 'bot') {
    return <BotMessage message={message} />;
  }

  return (
    <div className={classNames(styles.system, styles[message.type])}>
      {t(message.message)}
      {message.payload && (
        <div className={styles.payload}>
          {Object.entries(message.payload).map(([key, value]) => (
            <div key={key} className={styles.payloadItem}>
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
