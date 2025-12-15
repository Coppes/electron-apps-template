import { describe, it, expect } from 'vitest';
import { cn } from '../../../../../src/renderer/utils/cn.js';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('class1', true && 'class2', false && 'class3')).toBe('class1 class2');
  });

  it('should merge tailwind classes correctly', () => {
    // p-4 should override p-2
    expect(cn('p-2', 'p-4')).toBe('p-4');

    // text-red-500 should override text-blue-500
    expect(cn('text-blue-500', 'text-red-500')).toBe('text-red-500');
  });

  it('should handle arrays and objects', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
    expect(cn({ 'class1': true, 'class2': false })).toBe('class1');
  });

  it('should handle complex combinations', () => {
    expect(cn(
      'base-class',
      { 'active': true, 'disabled': false },
      ['nested-class', { 'deep-nested': true }],
      'p-2 p-4' // Tailwind merge test
    )).toBe('base-class active nested-class deep-nested p-4');
  });
});
