import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function hlm(first: ClassValue, ...rest: ClassValue[]) {
  return twMerge(clsx(first, ...rest));
}
