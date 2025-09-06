import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge.
 * Combines conditional class logic with Tailwind CSS class merging.
 *
 * @param inputs - Class names or conditional class objects
 * @returns A single merged string of class names
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}