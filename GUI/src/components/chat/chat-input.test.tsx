import { fireEvent, render, screen } from '@testing-library/react';
import useTestServiceStore, { TestServiceStoreState } from 'store/test-services.store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ChatInput from './chat-input';

// Mock the translation hook
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return the key as-is for testing
  }),
}));

// Mock the test service store
vi.mock('store/test-services.store', () => ({
  default: {
    getState: vi.fn(),
  },
}));

describe('ChatInput', () => {
  let mockSendUserInput: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSendUserInput = vi.fn();
    vi.mocked(useTestServiceStore.getState).mockReturnValue({
      sendUserInput: mockSendUserInput,
    } as unknown as TestServiceStoreState);
  });

  it('should render the input field and send button', () => {
    render(<ChatInput />);

    expect(screen.getByText('chat.service-input:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('chat.input-placeholder')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should update input value when user types', () => {
    render(<ChatInput />);

    const input = screen.getByPlaceholderText('chat.input-placeholder');
    fireEvent.change(input, { target: { value: 'Hello world' } });

    expect(input).toHaveValue('Hello world');
  });

  it('should call sendUserInput and clear input when send button is clicked', () => {
    render(<ChatInput />);

    const input = screen.getByPlaceholderText('chat.input-placeholder');
    const sendButton = screen.getByRole('button');

    // Type some text
    fireEvent.change(input, { target: { value: 'Test message' } });

    // Click send button
    fireEvent.click(sendButton);

    expect(mockSendUserInput).toHaveBeenCalledWith('Test message');
    expect(input).toHaveValue('');
  });

  it('should call sendUserInput and clear input when Enter key is pressed', () => {
    render(<ChatInput />);

    const input = screen.getByPlaceholderText('chat.input-placeholder');

    // Type some text
    fireEvent.change(input, { target: { value: 'Test message' } });

    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSendUserInput).toHaveBeenCalledWith('Test message');
    expect(input).toHaveValue('');
  });

  it('should not call sendUserInput when Enter is pressed with empty input', () => {
    render(<ChatInput />);

    const input = screen.getByPlaceholderText('chat.input-placeholder');

    // Press Enter with empty input
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSendUserInput).not.toHaveBeenCalled();
  });

  it('should not call sendUserInput when Enter is pressed with whitespace-only input', () => {
    render(<ChatInput />);

    const input = screen.getByPlaceholderText('chat.input-placeholder');

    // Type only whitespace
    fireEvent.change(input, { target: { value: '   ' } });

    // Press Enter
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockSendUserInput).not.toHaveBeenCalled();
  });

  it('should disable send button when input is empty', () => {
    render(<ChatInput />);

    const sendButton = screen.getByRole('button');
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when input has content', () => {
    render(<ChatInput />);

    const input = screen.getByPlaceholderText('chat.input-placeholder');
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Test message' } });

    expect(sendButton).not.toBeDisabled();
  });

  it('should disable send button when input has only whitespace', () => {
    render(<ChatInput />);

    const input = screen.getByPlaceholderText('chat.input-placeholder');
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: '   ' } });

    expect(sendButton).toBeDisabled();
  });
});
