import { useCallback } from 'react';
import { useSettings } from '../contexts/SettingsContext';

import successSound from '../assets/sounds/success.mp3';
import errorSound from '../assets/sounds/error.mp3';
import clickSound from '../assets/sounds/click.mp3';
import notificationSound from '../assets/sounds/notification.mp3';

const SOUNDS = {
  success: successSound,
  error: errorSound,
  click: clickSound,
  notification: notificationSound,
};

/**
 * Hook to play UI sounds
 * Respects global mute setting
 */
export function useSound() {
  const { settings } = useSettings();
  const isMuted = settings?.audio?.muted ?? false;
  // const globalVolume = (settings?.audio?.volume ?? 100) / 100;

  const playSound = useCallback((type) => {
    if (isMuted) return;

    const src = SOUNDS[type];
    if (!src) {
      console.warn(`Sound type "${type}" not found`);
      return;
    }

    try {
      const audio = new Audio(src);
      // audio.volume = globalVolume; 
      audio.volume = 0.5; // Fixed volume for now as volume control implementation is bonus
      audio.play().catch(err => {
        // Auto-play policy might block this if not triggered by user interaction
        // or if file is missing
        // console.debug('Failed to play sound (expected if assets missing):', err);
      });
    } catch (error) {
      console.error('Error playing sound', error);
    }
  }, [isMuted]);

  return { playSound };
}
