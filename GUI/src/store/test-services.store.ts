import { t } from 'i18next';
import { runServiceTest } from 'services/service-tester';
import { ServiceTestError } from 'types/service-test-error';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';

type TestingMessageAuthor = 'enduser' | 'bot' | 'system';
type TestingMessageType = 'error' | 'normal' | 'info' | 'success';

export interface TestingMessage {
  id: string;
  author: TestingMessageAuthor;
  message: string;
  type: TestingMessageType;
  payload?: Record<string, string>;
}

interface TestServiceStoreState {
  isChatOpened: boolean;
  openChat: () => void;
  closeChat: () => void;
  chat: TestingMessage[];
  currentNodeId: string | null;
  changeCurrentNodeId: (currentNodeId?: string) => void;
  clearCurrentNodeId: () => void;
  addUserMessage: (message: string) => void;
  addBotMessage: (message: string, payload?: Record<string, string>) => void;
  pushMessage: (
    message: string,
    author: TestingMessageAuthor,
    type?: TestingMessageType,
    payload?: Record<string, string>,
  ) => void;
  addError: (error: string, payload?: ServiceTestError) => void;
  addInfo: (info: string, payload?: Record<string, string>) => void;
  addSuccess: (succes: string) => void;
  reset: () => void;
  waitingForInput: boolean;
  userInput: string | null;
  waitForUserInput: () => void;
  sendUserInput: (input: string) => void;
}

const useTestServiceStore = create<TestServiceStoreState>((set, get) => ({
  isChatOpened: false,
  openChat: () => {
    set({ isChatOpened: true });
  },
  closeChat: () =>
    set({
      chat: [],
      currentNodeId: null,
      isChatOpened: false,
    }),
  chat: [],
  currentNodeId: null,
  changeCurrentNodeId: (currentNodeId) => set({ currentNodeId }),
  clearCurrentNodeId: () => set({ currentNodeId: null }),
  addUserMessage: (message) => get().pushMessage(message, 'enduser'),
  addBotMessage: (message, payload) => get().pushMessage(message, 'bot', 'normal', payload),
  pushMessage: (message, author, type = 'normal', payload = undefined) => {
    const msg = {
      id: uuid(),
      message,
      author,
      type,
      payload,
    };

    set({
      chat: [...get().chat, msg],
    });
  },
  addError: (error, payload) => {
    const errorTranslation = t('chat.service-test-error', { returnObjects: true });
    console.log(errorTranslation);
    const payloadRecord = payload
      ? Object.fromEntries(
          Object.entries(payload).map(([key, value]) => [
            errorTranslation[key as keyof typeof errorTranslation],
            value,
          ]),
        )
      : undefined;
    get().pushMessage(error, 'system', 'error', payloadRecord);
  },
  addInfo: (info, payload) => get().pushMessage(info, 'system', 'info', payload),
  addSuccess: (success) => get().pushMessage(success, 'system', 'success'),
  reset: () => {
    set({
      chat: [],
      currentNodeId: null,
      waitingForInput: false,
      userInput: null,
    });
  },
  waitingForInput: false,
  userInput: null,
  waitForUserInput: () =>
    set({
      waitingForInput: true,
      userInput: null,
    }),
  sendUserInput: async (userInput) => {
    get().addUserMessage(userInput);
    set({
      waitingForInput: false,
      userInput,
    });
    await runServiceTest(userInput);
  },
}));

export default useTestServiceStore;
