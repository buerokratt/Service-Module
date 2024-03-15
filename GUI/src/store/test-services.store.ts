import { create } from 'zustand';
import { v4 as uuid } from "uuid";
import { testServiceFlow } from 'services/flow-tester';

type TestingMessageAuthor = 'enduser' | 'bot' | 'system';
type TestingMessageType = 'error' | 'normal' | 'info' | 'success';

export interface TestingMessage {
  id: string;
  author: TestingMessageAuthor;
  message: string;
  type: TestingMessageType;
  payload?: any;
}

interface TestServiceStoreState {
  isChatEnabled: boolean;
  enableChat: () => void;
  disableChat: () => void;
  isChatOpened: boolean;
  openChat: () => void;
  closeChat: () => void;
  chat: TestingMessage[];
  currentNodeId: string | null;
  changeCurrentNodeId: (currentNodeId?: string) => void;
  clearCurrentNodeId: () => void;
  addUserMessage: (message: string) => void;
  addBotMessage: (message: string, payload?: string) => void;
  pushMessage: (message: string, author: TestingMessageAuthor, type?: TestingMessageType, payload?: any) => void;
  addError: (error: string) => void;
  addInfo: (info: string, payload?: any) => void;
  addSuccess: (succes: string) => void;
  reset: () => void;
  waitingForInput: boolean;
  userInput: string | null;
  waitForUserInput: () => void;
  sendUserInput: (input: string) => void;
}

const useTestServiceStore = create<TestServiceStoreState>((set, get) => ({
  isChatEnabled: false,
  enableChat: () => set({ isChatEnabled: true }),
  disableChat: () => set({ isChatEnabled: false }),
  isChatOpened: false,
  openChat: () => {
    testServiceFlow();
    set({ isChatOpened: true });
  },
  closeChat: () => set({ 
    chat: [],
    currentNodeId: null,
    isChatOpened: false,
  }),
  chat: [],
  currentNodeId: null,
  changeCurrentNodeId: currentNodeId => set({ currentNodeId }),
  clearCurrentNodeId: () => set({ currentNodeId: null }),
  addUserMessage: (message) => get().pushMessage(message, 'enduser'),
  addBotMessage: (message, payload) => get().pushMessage(message, 'bot', 'normal', payload),
  pushMessage: (message, author, type = 'normal', payload = null) => {
    const msg = {
      id: uuid(),
      message,
      author,
      type,
      payload,
    };

    set({
      chat: [ ...get().chat, msg ]
    })
  },
  addError: (error) => get().pushMessage(error, 'system', 'error'),
  addInfo: (info, payload) => get().pushMessage(info, 'system', 'info', payload),
  addSuccess: (succes) => get().pushMessage(succes, 'system', 'success'),
  reset: () => set({ 
    chat: [],
    currentNodeId: null,
  }),
  waitingForInput: false,
  userInput: null,
  waitForUserInput: () => set({ 
    waitingForInput: true,
    userInput: null,
  }),
  sendUserInput: (userInput) => {
    get().addUserMessage(userInput);
    set({ 
      waitingForInput: false,
      userInput,
    })
  },
}));

export default useTestServiceStore;
