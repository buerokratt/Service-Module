import { useMemo } from 'react';
import useTestServiceStore, { TestingMessage } from 'store/test-services.store';
import { parseButtons } from 'utils/chat-utils';
import styles from './chat.module.scss';

const ChatButtonGroup = ({ message }: { message: TestingMessage }): JSX.Element => {
  const parsedButtons = useMemo(() => {
    return parseButtons(message);
  }, [message.buttons]);

  return (
    <div className={styles.buttonsRow}>
      {parsedButtons?.map(({ title, payload }) => (
        <button key={payload} type="button" className={styles.actionButton} onClick={() => {
            useTestServiceStore.getState().sendUserInput('', payload.split('/').at(-1) ?? '');
        }}>
          {title}
        </button>
      ))}
    </div>
  );
};

export default ChatButtonGroup;
