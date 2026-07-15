import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function talkingTime(text: string, wpm = 130) {
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const totalSeconds = Math.round((words / wpm) * 60);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return { words, mins, secs, totalSeconds };
}

export function formatTalkingTime(text: string, wpm = 130): string {
  const { mins, secs, totalSeconds } = talkingTime(text, wpm);
  if (totalSeconds === 0) return '0s';
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}
