import { TestingMessage } from 'store/test-services.store';
import { MessageButton } from 'types/message';

export const parseButtons = (message: TestingMessage): MessageButton[] => {
  try {
    if (!message?.buttons || message.buttons === '') return [];
    return JSON.parse(message.buttons) as MessageButton[];
  } catch (e) {
    console.error(e);
    return [];
  }
};
