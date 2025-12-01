import classNames from 'classnames';
import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { TestingMessage } from 'store/test-services.store';

import styles from './chat.module.scss';
import RobotIcon from '../../static/icons/buerokratt.svg';

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

  const renderConent = useCallback(() => {
    if (message.message.startsWith('<p>')) return message.message.replace('<p>', '').replace('</p>', '');
    return t(message.message);
  }, [message.message, t]);

  return (
    <motion.div animate={leftAnimation.animate} initial={leftAnimation.initial} transition={leftAnimation.transition}>
      <div className={classNames(styles.message, styles.admin)}>
        <div className={styles.main}>
          <div className={styles.icon}>
            <img src={RobotIcon} alt="Robot icon" />
          </div>
          <div className={styles.content}>{renderConent()}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default BotMessage;
