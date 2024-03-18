import { motion } from "framer-motion";
import styles from "./chat.module.scss";
import ChatHeader from "components/chat/chat-header";
import ChatContent from "./chat-content";
import ChatKeyPad from "./chat-keypad";
import useTestServiceStore from "store/test-services.store";
import Profile from "./profile";

const Chat = (): JSX.Element => {
  const opened = useTestServiceStore(x => x.isChatOpened);

  return !opened 
  ? <Profile /> 
  : (
    <div className={styles.chatWrapper}>
      <motion.div
        className={styles.chat}
        animate={{ y: 0 }}
        style={{ y: 400 }}
      >
        <ChatHeader />
        <ChatContent />
        <ChatKeyPad />
      </motion.div>
    </div>
  );
}

export default Chat;
