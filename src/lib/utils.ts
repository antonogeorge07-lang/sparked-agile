import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Polyfill for requestIdleCallback / cancelIdleCallback for broader browser support
export const requestIdleCallback: any = (typeof window !== 'undefined' && (window as any).requestIdleCallback)
  ? (window as any).requestIdleCallback.bind(window)
  : (cb: any) => setTimeout(cb, 1);

export const cancelIdleCallback: any = (typeof window !== 'undefined' && (window as any).cancelIdleCallback)
  ? (window as any).cancelIdleCallback.bind(window)
  : (id: any) => clearTimeout(id);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
