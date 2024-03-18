import styles from './chat.module.scss';
import classNames from "classnames";
import { TestingMessage } from 'store/test-services.store';
import UserMessage from './user-message';
import BotMessage from './bot-message';
import { useTranslation } from 'react-i18next';

interface ChatMessageProps {
  message: TestingMessage;
}

const ChatMessage = ({ message }: ChatMessageProps) :JSX.Element => {
  const { t } = useTranslation();

  if(message.author === 'enduser') {
    return <UserMessage message={message}/>
  }

  if(message.author === 'bot') {
    return <BotMessage message={message} />;
  }
  
  return (
    <div className={classNames(styles.system, styles[message.type])}>
      {t(message.message)}
      {
        message.payload && <a className={styles.link} href={message.payload.link}>{message.payload.title}</a> 
      }
    </div>
  );
}

export default ChatMessage;
