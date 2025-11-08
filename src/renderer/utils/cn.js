/**
 * Combina classes CSS usando clsx e tailwind-merge
 * Respeita a precedência do Tailwind CSS
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
