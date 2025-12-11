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

export interface ParsedService {
  serviceName: string;
  serviceInputs: string;
}

export const parseServiceString = (input: string): ParsedService => {
  const servicePathMatch = new RegExp(/\/\w+\/services\/active\/([^,\s(]+)/).exec(input);
  const serviceName = servicePathMatch ? servicePathMatch[1] : '';

  const inputsMatch = new RegExp(/\(([^()]*(?:\([^()]*\)[^()]*)*)\)/).exec(input);
  const serviceInputs = inputsMatch ? inputsMatch[1] : '';

  return {
    serviceName,
    serviceInputs,
  };
};
