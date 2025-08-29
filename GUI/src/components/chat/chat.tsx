import ChatHeader from 'components/chat/chat-header';
import { motion } from 'framer-motion';
import React from 'react';
import useServiceStore from 'store/new-services.store';
import useTestServiceStore from 'store/test-services.store';

import ChatContent from './chat-content';
import ChatKeyPad from './chat-keypad';
import styles from './chat.module.scss';
import Profile from './profile';

const Chat = (): React.JSX.Element => {
  const state = useServiceStore((x) => x.serviceState);
  const opened = useTestServiceStore((x) => x.isChatOpened);

  if (!state) return <></>;

  return !opened ? (
    <Profile />
  ) : (
    <div className={styles.chatWrapper}>
      <motion.div className={styles.chat} animate={{ y: 0 }} style={{ y: 400 }}>
        <ChatHeader />
        <ChatContent />
        <ChatKeyPad />
      </motion.div>
    </div>
  );
};

export default Chat;
