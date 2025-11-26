import { render, screen } from '@testing-library/react';
import { TestingMessage } from 'store/test-services.store';
import { describe, expect, it, vi } from 'vitest';

import ChatMessage from './chat-message';
import styles from './chat.module.scss';

// Mock the translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return the key as-is for testing
  }),
}));

// Mock the child components
vi.mock('./user-message', () => ({
  default: ({ message }: { message: TestingMessage }) => (
    <div data-testid="user-message">
      <span data-testid="user-message-text">{message.message}</span>
    </div>
  ),
}));

vi.mock('./bot-message', () => ({
  default: ({ message }: { message: TestingMessage }) => (
    <div data-testid="bot-message">
      <span data-testid="bot-message-text">{message.message}</span>
    </div>
  ),
}));

describe('ChatMessage', () => {
  const createMessage = (overrides: Partial<TestingMessage> = {}): TestingMessage => ({
    id: 'test-id',
    author: 'system',
    message: 'test.message.key',
    type: 'normal',
    ...overrides,
  });

  describe('User messages', () => {
    it('should render UserMessage component for enduser author', () => {
      const message = createMessage({ author: 'enduser', message: 'Hello from user' });

      render(<ChatMessage message={message} />);

      expect(screen.getByTestId('user-message')).toBeInTheDocument();
      expect(screen.getByTestId('user-message-text')).toHaveTextContent('Hello from user');
    });
  });

  describe('Bot messages', () => {
    it('should render BotMessage component for bot author', () => {
      const message = createMessage({ author: 'bot', message: 'Hello from bot' });

      render(<ChatMessage message={message} />);

      expect(screen.getByTestId('bot-message')).toBeInTheDocument();
      expect(screen.getByTestId('bot-message-text')).toHaveTextContent('Hello from bot');
    });
  });

  describe('System messages', () => {
    it('should render system message with translated text', () => {
      const message = createMessage({
        author: 'system',
        message: 'system.message.key',
        type: 'info',
      });

      render(<ChatMessage message={message} />);

      expect(screen.getByText('system.message.key')).toBeInTheDocument();
    });

    it('should apply correct CSS classes for system message', () => {
      const message = createMessage({
        author: 'system',
        message: 'system.message.key',
        type: 'error',
      });

      const { container } = render(<ChatMessage message={message} />);

      const systemMessage = container.firstChild as HTMLElement;
      expect(systemMessage).toHaveClass(styles.system, styles.error);
    });

    it('should render payload when provided', () => {
      const message = createMessage({
        author: 'system',
        message: 'system.message.key',
        type: 'info',
        payload: {
          key1: 'value1',
          key2: 'value2',
        },
      });

      render(<ChatMessage message={message} />);

      expect(screen.getByText('key1:')).toBeInTheDocument();
      expect(screen.getByText('value1')).toBeInTheDocument();
      expect(screen.getByText('key2:')).toBeInTheDocument();
      expect(screen.getByText('value2')).toBeInTheDocument();
    });

    it('should not render payload section when payload is undefined', () => {
      const message = createMessage({
        author: 'system',
        message: 'system.message.key',
        type: 'info',
        payload: undefined,
      });

      const { container } = render(<ChatMessage message={message} />);

      expect(container.querySelector(`.${styles.payload}`)).not.toBeInTheDocument();
    });

    it('should handle empty payload object', () => {
      const message = createMessage({
        author: 'system',
        message: 'system.message.key',
        type: 'info',
        payload: {},
      });

      const { container } = render(<ChatMessage message={message} />);

      expect(container.querySelector(`.${styles.payload}`)).toBeInTheDocument();
      expect(container.querySelectorAll(`.${styles.payloadItem}`)).toHaveLength(0);
    });

    it('should handle different message types', () => {
      const types: Array<'error' | 'normal' | 'info' | 'success'> = ['error', 'normal', 'info', 'success'];

      types.forEach((type) => {
        const message = createMessage({
          author: 'system',
          message: `system.${type}.message`,
          type,
        });

        const { container } = render(<ChatMessage message={message} />);

        const systemMessage = container.firstChild as HTMLElement;
        expect(systemMessage).toHaveClass(styles.system, styles[type]);
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle message with special characters in payload values', () => {
      const message = createMessage({
        author: 'system',
        message: 'system.message.key',
        type: 'info',
        payload: {
          'special-key': 'value with spaces & symbols!',
          'another-key': 'value with "quotes"',
        },
      });

      render(<ChatMessage message={message} />);

      expect(screen.getByText('special-key:')).toBeInTheDocument();
      expect(screen.getByText('value with spaces & symbols!')).toBeInTheDocument();
      expect(screen.getByText('another-key:')).toBeInTheDocument();
      expect(screen.getByText('value with "quotes"')).toBeInTheDocument();
    });

    it('should handle empty string payload values', () => {
      const message = createMessage({
        author: 'system',
        message: 'system.message.key',
        type: 'info',
        payload: {
          'empty-key': '',
          'normal-key': 'normal value',
        },
      });

      render(<ChatMessage message={message} />);

      expect(screen.getByText('empty-key:')).toBeInTheDocument();
      expect(screen.getByText('normal-key:')).toBeInTheDocument();
      expect(screen.getByText('normal value')).toBeInTheDocument();
    });
  });
});
