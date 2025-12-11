import { runServiceTest } from 'services/service-tester';
import { v4 as uuid } from 'uuid';
import { create } from 'zustand';

type TestingMessageAuthor = 'enduser' | 'bot' | 'system';
type TestingMessageType = 'error' | 'normal' | 'info' | 'success';

export interface TestingMessage {
  id: string;
  author: TestingMessageAuthor;
  message: string;
  buttons?: string;
  type: TestingMessageType;
  payload?: Record<string, string>;
}

type TestingMessagePayload = Record<string, string>;

export interface TestServiceStoreState {
  isChatOpened: boolean;
  openChat: () => void;
  closeChat: () => void;
  chat: TestingMessage[];
  currentNodeId: string | null;
  changeCurrentNodeId: (currentNodeId?: string) => void;
  clearCurrentNodeId: () => void;
  addUserMessage: (message: string) => void;
  addBotMessage: (message: string, buttons?: string) => void;
  pushMessage: (
    message: string,
    author: TestingMessageAuthor,
    type?: TestingMessageType,
    payload?: TestingMessagePayload,
    buttons?: string,
  ) => void;
  addError: (error: string, payload?: TestingMessagePayload) => void;
  addInfo: (info: string, payload?: TestingMessagePayload) => void;
  addSuccess: (succes: string) => void;
  reset: () => void;
  waitingForInput: boolean;
  userInput: string | null;
  waitForUserInput: () => void;
  sendUserInput: (input: string, serviceName?: string) => void;
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
  addBotMessage: (message, buttons) => get().pushMessage(message, 'bot', 'normal', undefined, buttons),
  pushMessage: (message, author, type = 'normal', payload = undefined, buttons = undefined) => {
    const msg = {
      id: uuid(),
      message,
      author,
      type,
      payload,
      buttons,
    };

    set({
      chat: [...get().chat, msg],
    });
  },
  addError: (error: string, payload?: TestingMessagePayload) => {
    get().pushMessage(error, 'system', 'error', payload);
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
  sendUserInput: async (userInput, serviceName) => {
    get().addUserMessage(userInput);
    set({
      waitingForInput: false,
      userInput,
    });
    await runServiceTest(userInput, serviceName);
  },
}));

export default useTestServiceStore;
