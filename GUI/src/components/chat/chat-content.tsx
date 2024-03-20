import { useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import useTestServiceStore from 'store/test-services.store';
import ChatMessage from './chat-message';
import styles from './chat.module.scss';
import 'overlayscrollbars/css/OverlayScrollbars.css';

const ChatContent = (): JSX.Element => {
  const OSref = useRef<OverlayScrollbarsComponent>(null);
  const chat = useTestServiceStore(x => x.chat);

  useEffect(() => {
    if (OSref.current) {
      const instance = OSref.current.osInstance();
      instance?.scroll({ y: '100%' }, 200);
    }
  }, [chat]);


  return (
    <AnimatePresence initial={false}>
      <div className={styles.chatContent}>
        <OverlayScrollbarsComponent
          className="os-host-flexbox os-custom-theme"
          ref={OSref}
          options={{
            overflowBehavior: { x: 'hidden' },
            scrollbars: { visibility: 'auto', autoHide: 'leave' },
          }}
        >
          {chat.map((message) => <ChatMessage message={message} key={message.id} />)}
        </OverlayScrollbarsComponent>
      </div>
    </AnimatePresence>
  );
};

export default ChatContent;
