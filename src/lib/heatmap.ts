import { addDays, format, parseISO, subDays } from 'date-fns';
import type { HeatMapEntry } from '../types';

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export type HeatmapBucket = 0 | 1 | 2 | 3 | 4;

export interface HeatmapDay {
  date: string;
  wordCount: number;
  bucket: HeatmapBucket;
}

/** null marks a padding cell outside the date range, used to align the grid to week rows. */
export type HeatmapCell = HeatmapDay | null;

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (sorted.length - 1) * p;
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
}

/** Quartile cut points computed from this user's own non-zero entries, so buckets adapt per user. */
export function computeQuartileThresholds(entries: HeatMapEntry[]): [number, number, number] {
  const counts = entries
    .map((e) => e.wordCount)
    .filter((c) => c > 0)
    .sort((a, b) => a - b);
  return [percentile(counts, 0.25), percentile(counts, 0.5), percentile(counts, 0.75)];
}

export function getBucket(wordCount: number, [q1, q2, q3]: [number, number, number]): HeatmapBucket {
  if (wordCount <= 0) return 0;
  if (wordCount <= q1) return 1;
  if (wordCount <= q2) return 2;
  if (wordCount <= q3) return 3;
  return 4;
}

/**
 * Lays out the past 365 days as week columns (Sun-Sat rows), GitHub-style.
 * Days with no entry get wordCount 0 / bucket 0 rather than being omitted,
 * since the heatmap needs every day represented to show gaps.
 */
export function buildHeatmapWeeks(entries: HeatMapEntry[], today: Date): HeatmapCell[][] {
  const wordCountByDate = new Map(entries.map((e) => [e.entryDate, e.wordCount]));
  const thresholds = computeQuartileThresholds(entries);

  const start = subDays(today, 364);
  const days: HeatmapCell[] = Array(start.getDay()).fill(null);

  for (let i = 0; i <= 364; i++) {
    const date = format(addDays(start, i), 'yyyy-MM-dd');
    const wordCount = wordCountByDate.get(date) ?? 0;
    days.push({ date, wordCount, bucket: getBucket(wordCount, thresholds) });
  }
  while (days.length % 7 !== 0) days.push(null);

  const weeks: HeatmapCell[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  return weeks;
}

export function getMostWordsDay(entries: HeatMapEntry[]): HeatMapEntry | null {
  if (entries.length === 0) return null;
  return entries.reduce((max, e) => (e.wordCount > max.wordCount ? e : max), entries[0]);
}

/** Average words per entry written in the last 7 days (today inclusive). 0 if nothing was written. */
export function getWeeklyAverage(entries: HeatMapEntry[], today: Date): number {
  const weekStart = format(subDays(today, 6), 'yyyy-MM-dd');
  const todayStr = format(today, 'yyyy-MM-dd');
  const weekEntries = entries.filter((e) => e.entryDate >= weekStart && e.entryDate <= todayStr);
  if (weekEntries.length === 0) return 0;
  const total = weekEntries.reduce((sum, e) => sum + e.wordCount, 0);
  return Math.round(total / weekEntries.length);
}

export function getTotalWords(entries: HeatMapEntry[]): number {
  return entries.reduce((sum, e) => sum + e.wordCount, 0);
}

/** The weekday with the highest average word count per entry, or null with no entries yet. */
export function getBusiestDayOfWeek(entries: HeatMapEntry[]): string | null {
  const totals = new Array(7).fill(0);
  const counts = new Array(7).fill(0);

  for (const e of entries) {
    if (e.wordCount <= 0) continue;
    const day = parseISO(e.entryDate).getDay();
    totals[day] += e.wordCount;
    counts[day]++;
  }

  let bestDay = -1;
  let bestAverage = -1;
  for (let day = 0; day < 7; day++) {
    if (counts[day] === 0) continue;
    const average = totals[day] / counts[day];
    if (average > bestAverage) {
      bestAverage = average;
      bestDay = day;
    }
  }

  return bestDay === -1 ? null : WEEKDAY_NAMES[bestDay];
}

/**
 * Consecutive weekdays with an entry, walking backward from today — weekends are
 * skipped rather than treated as gaps. If today (or the most recent weekday) has
 * no entry yet, it isn't counted as a break; the count starts from the prior weekday.
 */
export function getCurrentStreak(entries: HeatMapEntry[], today: Date): number {
  const writtenDates = new Set(entries.filter((e) => e.wordCount > 0).map((e) => e.entryDate));

  let cursor = today;
  while (isWeekend(cursor)) cursor = subDays(cursor, 1);

  if (!writtenDates.has(format(cursor, 'yyyy-MM-dd'))) {
    cursor = subDays(cursor, 1);
    while (isWeekend(cursor)) cursor = subDays(cursor, 1);
  }

  let streak = 0;
  while (writtenDates.has(format(cursor, 'yyyy-MM-dd'))) {
    streak++;
    cursor = subDays(cursor, 1);
    while (isWeekend(cursor)) cursor = subDays(cursor, 1);
  }
  return streak;
}

/** Longest run of consecutive weekdays with an entry within the past year. Weekends don't break a streak. */
export function getLongestStreak(entries: HeatMapEntry[], today: Date): number {
  const writtenDates = new Set(entries.filter((e) => e.wordCount > 0).map((e) => e.entryDate));
  const start = subDays(today, 364);

  let longest = 0;
  let current = 0;
  for (let i = 0; i <= 364; i++) {
    const cursor = addDays(start, i);
    if (isWeekend(cursor)) continue;
    if (writtenDates.has(format(cursor, 'yyyy-MM-dd'))) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }
  return longest;
}
