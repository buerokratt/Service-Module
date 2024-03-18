import { motion } from 'framer-motion';
import styles from './chat.module.scss';
import RobotIcon from "../../static/icons/buerokratt.svg";
import classNames from "classnames";
import { TestingMessage } from 'store/test-services.store';
import { useTranslation } from 'react-i18next';

const leftAnimation = {
  animate: { opacity: 1, x: 0 },
  initial: { opacity: 0, x: -20 },
  transition: { duration: 0.25, delay: 0.25 },
};

interface ChatMessageProps {
  message: TestingMessage;
}

const BotMessage = ({ message }: ChatMessageProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      animate={leftAnimation.animate}
      initial={leftAnimation.initial}
      transition={leftAnimation.transition}
    >
      <div className={classNames(styles.message, styles.admin)}>
        <div className={styles.main}>
          <div className={styles.icon}>
            <img src={RobotIcon} alt="Robot icon" />
          </div>
          <div className={styles.content}>
            {
              message.payload
              ? <a className={styles.link} href={message.payload}>{message.message}</a>
              : t(message.message)
            }
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default BotMessage;
