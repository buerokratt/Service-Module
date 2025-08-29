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
      {JSON.stringify(message.payload)}
      {/* {message.payload && (
        <a className={styles.link} href={message.payload.link}>
          {message.payload.title}
        </a>
      )} */}
    </div>
  );
};

export default ChatMessage;
