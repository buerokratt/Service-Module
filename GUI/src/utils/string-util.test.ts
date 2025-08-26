import { describe, it, expect } from 'vitest';

// Simple test to verify Vitest is working
describe('String Utils', () => {
  it('should convert string to uppercase', () => {
    const input = 'hello world';
    const expected = 'HELLO WORLD';
    expect(input.toUpperCase()).toBe(expected);
  });

  it('should check if string is empty', () => {
    expect('').toBe('');
    expect('hello').not.toBe('');
  });

  it('should get string length', () => {
    expect('test').toHaveLength(4);
    expect('').toHaveLength(0);
  });
});
