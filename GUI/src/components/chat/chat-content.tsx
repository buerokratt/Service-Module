import { AnimatePresence } from 'framer-motion';
import styles from './chat.module.scss';
import useTestServiceStore from 'store/test-services.store';
import ChatMessage from './chat-message';

const ChatContent = (): JSX.Element => {
  const chat = useTestServiceStore(x => x.chat);

  return (
    <AnimatePresence initial={false}>
      <div className={styles.chatContent}>
        {chat.map((message) => <ChatMessage message={message} key={message.id} />)}
      </div>
    </AnimatePresence>
  );
};

export default ChatContent;
