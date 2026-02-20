import classNames from 'classnames';
import { Track } from 'components';
import Markdownify from 'components/Markdowify';
import { motion } from 'framer-motion';
import { useCallback, useMemo } from 'react';
import { TestingMessage } from 'store/test-services.store';
import { parseButtons } from 'utils/chat-utils';

import ChatButtonGroup from './chat-button-group';
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
  const renderContent = useCallback(() => {
    if (message.message.startsWith('<p>')) return message.message.replace('<p>', '').replace('</p>', '');
    return <Markdownify message={message.message} />;
  }, [message.message]);

  const hasButtons = useMemo(() => {
    return parseButtons(message).length > 0;
  }, [message]);

  return (
    <motion.div animate={leftAnimation.animate} initial={leftAnimation.initial} transition={leftAnimation.transition}>
      <div className={classNames(styles.message, styles.admin)}>
        <div className={styles.main}>
          <div className={styles.icon}>
            <img src={RobotIcon} alt="Robot icon" />
          </div>
          <Track direction="vertical" gap={5} align="left">
            {message.message && <div className={styles.content}>{renderContent()}</div>}
            {hasButtons && <ChatButtonGroup message={message} />}
          </Track>
        </div>
      </div>
    </motion.div>
  );
};

export default BotMessage;
