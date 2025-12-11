import React, { useMemo } from 'react';
import useTestServiceStore, { TestingMessage } from 'store/test-services.store';
import { parseButtons, parseServiceString } from 'utils/chat-utils';
import { generateUniqueId } from 'utils/flow-utils';

import styles from './chat.module.scss';

const ChatButtonGroup = ({ message }: { message: TestingMessage }): React.JSX.Element => {
  const parsedButtons = useMemo(() => {
    return parseButtons(message);
  }, [message]);

  return (
    <div className={styles.buttonsRow}>
      {parsedButtons?.map(({ title, payload }) => {
        const { serviceName, serviceInputs } = parseServiceString(payload);

        return (
          <button
            key={generateUniqueId()}
            type="button"
            className={styles.actionButton}
            onClick={() => {
              useTestServiceStore.getState().sendUserInput(serviceInputs, serviceName);
            }}
          >
            {title}
          </button>
        );
      })}
    </div>
  );
};

export default ChatButtonGroup;
