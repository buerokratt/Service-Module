import { runServiceTest } from 'services/service-tester';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import useTestServiceStore from './test-services.store';

// Mock the service-tester module
vi.mock('services/service-tester', () => ({
  runServiceTest: vi.fn().mockResolvedValue(undefined),
}));

// Mock the uuid module
vi.mock('uuid', () => ({
  v4: () => 'test-uuid-123',
}));

describe('useTestServiceStore', () => {
  beforeEach(() => {
    // Reset the store state before each test
    useTestServiceStore.getState().reset();
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('sendUserInput', () => {
    it('should add user message to chat', () => {
      const userInput = 'Hello, this is a test message';

      useTestServiceStore.getState().sendUserInput(userInput);

      const chat = useTestServiceStore.getState().chat;
      expect(chat).toHaveLength(1);
      expect(chat[0]).toEqual({
        id: 'test-uuid-123',
        author: 'enduser',
        message: userInput,
        type: 'normal',
        payload: undefined,
      });
    });

    it('should set waitingForInput to false', () => {
      const userInput = 'Test input';

      // Set waitingForInput to true first
      useTestServiceStore.getState().waitForUserInput();
      expect(useTestServiceStore.getState().waitingForInput).toBe(true);

      useTestServiceStore.getState().sendUserInput(userInput);

      expect(useTestServiceStore.getState().waitingForInput).toBe(false);
    });

    it('should set userInput to the provided input', () => {
      const userInput = 'Another test message';

      useTestServiceStore.getState().sendUserInput(userInput);

      expect(useTestServiceStore.getState().userInput).toBe(userInput);
    });

    it('should call runServiceTest with the user input', () => {
      const userInput = 'Service test input';

      useTestServiceStore.getState().sendUserInput(userInput);

      expect(runServiceTest).toHaveBeenCalledWith(userInput, undefined);
      expect(runServiceTest).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple consecutive calls', () => {
      const inputs = ['First message', 'Second message', 'Third message'];

      for (const input of inputs) {
        useTestServiceStore.getState().sendUserInput(input);
      }

      expect(useTestServiceStore.getState().chat).toHaveLength(3);
      expect(useTestServiceStore.getState().userInput).toBe('Third message');
      expect(runServiceTest).toHaveBeenCalledTimes(3);
      expect(runServiceTest).toHaveBeenNthCalledWith(1, 'First message', undefined);
      expect(runServiceTest).toHaveBeenNthCalledWith(2, 'Second message', undefined);
      expect(runServiceTest).toHaveBeenNthCalledWith(3, 'Third message', undefined);
    });

    it('should handle empty string input', () => {
      const userInput = '';

      useTestServiceStore.getState().sendUserInput(userInput);

      expect(useTestServiceStore.getState().chat).toHaveLength(1);
      expect(useTestServiceStore.getState().chat[0].message).toBe('');
      expect(useTestServiceStore.getState().userInput).toBe('');
      expect(runServiceTest).toHaveBeenCalledWith('', undefined);
    });

    it('should handle special characters in input', () => {
      const userInput = 'Test with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?';

      useTestServiceStore.getState().sendUserInput(userInput);

      expect(useTestServiceStore.getState().chat).toHaveLength(1);
      expect(useTestServiceStore.getState().chat[0].message).toBe(userInput);
      expect(useTestServiceStore.getState().userInput).toBe(userInput);
      expect(runServiceTest).toHaveBeenCalledWith(userInput, undefined);
    });
  });
});
