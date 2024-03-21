import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Send from "../../static/icons/send.svg";
import styles from './chat.module.scss';
import useTestServiceStore from "store/test-services.store";

const ChatKeyPad = (): JSX.Element => {
  const [userInput, setUserInput] = useState<string>("");
  const { t } = useTranslation();

  const addNewMessageToState = (): void => {
    useTestServiceStore.getState().sendUserInput(userInput);
    setUserInput("");
  };

  return (
    <div>
      <div className={styles.keypad}>
        <input
          className={styles.input}
          value={userInput}
          placeholder={t("chat.input-placeholder") ?? ''}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                addNewMessageToState();
              }
            }
          }
        />
      <div
        onClick={addNewMessageToState}
        className={styles.button}
        role="button"
        tabIndex={0}
      >
        <img src={Send} alt="Send message icon" />
      </div>
    </div>
    </div>
  );
}

export default ChatKeyPad;
