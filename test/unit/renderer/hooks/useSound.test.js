import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSound } from '../../../../src/renderer/hooks/useSound';
import * as SettingsContext from '../../../../src/renderer/contexts/SettingsContext';

// Mock Settings Context
vi.mock('../../../../src/renderer/contexts/SettingsContext', () => ({
  useSettings: vi.fn()
}));

// Mock Audio
const mockPlay = vi.fn().mockResolvedValue(undefined);
const mockAudioConstructor = vi.fn();

global.Audio = class {
  constructor(src) {
    this.src = src;
    mockAudioConstructor(src);
    this.volume = 1;
  }
  play() {
    return mockPlay();
  }
};

describe('useSound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should play sound when not muted', () => {
    SettingsContext.useSettings.mockReturnValue({
      settings: { audio: { muted: false, volume: 100 } }
    });

    const { result } = renderHook(() => useSound());

    act(() => {
      result.current.playSound('click');
    });

    expect(mockAudioConstructor).toHaveBeenCalledWith(expect.stringContaining('click.mp3'));
    expect(mockPlay).toHaveBeenCalled();
  });

  it('should not play sound when muted', () => {
    SettingsContext.useSettings.mockReturnValue({
      settings: { audio: { muted: true, volume: 100 } }
    });

    const { result } = renderHook(() => useSound());

    act(() => {
      result.current.playSound('click');
    });

    expect(mockAudioConstructor).not.toHaveBeenCalled();
    expect(mockPlay).not.toHaveBeenCalled();
  });

  it('should warn if invalid sound type used', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
    SettingsContext.useSettings.mockReturnValue({
      settings: { audio: { muted: false } }
    });

    const { result } = renderHook(() => useSound());

    act(() => {
      result.current.playSound('invalid-sound');
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Sound type "invalid-sound" not found'));
    expect(mockAudioConstructor).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
