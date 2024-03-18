import { motion } from 'framer-motion';
import styles from './chat.module.scss';
import PersonIcon from "../../static/icons/person.svg";
import classNames from "classnames";
import { TestingMessage } from 'store/test-services.store';

const rightAnimation = {
  animate: { opacity: 1, x: 0 },
  initial: { opacity: 0, x: 20 },
  transition: { duration: 0.25, delay: 0.25 },
};

interface ChatMessageProps {
  message: TestingMessage;
}

const UserMessage = ({ message }: ChatMessageProps) => (
  <motion.div
    animate={rightAnimation.animate}
    initial={rightAnimation.initial}
    transition={rightAnimation.transition}
  >
    <div className={classNames(styles.message, styles.client)}>
      <div className={styles.icon}>
        <img src={PersonIcon} alt="Person icon" />
      </div>
      <div className={styles.content}>
        <span>{message.message}</span>
      </div>
    </div>
  </motion.div>
);

export default UserMessage;
