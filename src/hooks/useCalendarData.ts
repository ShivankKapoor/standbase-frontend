import { useCallback, useRef, useState } from 'react';
import { getEntries } from '../api/entries';
import { getTodoSummary } from '../api/todos';
import type { DayType, Todo, TodoSummary } from '../types';

type EntryMap = Record<string, DayType | null>;
type TodoSummaryMap = Record<string, boolean>;

const monthKey = (year: number, month: number) => `${year}-${String(month).padStart(2, '0')}`;

/** Replace every key belonging to one month (prefix "YYYY-MM-") with fresh values. */
function replaceMonth<T>(prev: Record<string, T>, prefix: string, fresh: Record<string, T>) {
  const next: Record<string, T> = {};
  for (const k of Object.keys(prev)) if (!k.startsWith(prefix)) next[k] = prev[k];
  return { ...next, ...fresh };
}

function toSummaryMap(data: TodoSummary[]): TodoSummaryMap {
  const map: TodoSummaryMap = {};
  data.forEach((s) => { map[s.date] = s.allCompleted; });
  return map;
}

/**
 * Calendar data for any number of months at once, loaded lazily and cached.
 * Used by both the paged desktop calendar and the continuously scrolling mobile one.
 */
export function useCalendarData() {
  const [entryMap, setEntryMap] = useState<EntryMap>({});
  const [todoSummary, setTodoSummary] = useState<TodoSummaryMap>({});
  const loaded = useRef(new Set<string>());

  const loadTodoMonth = useCallback(async (year: number, month: number) => {
    const prefix = `${monthKey(year, month)}-`;
    try {
      const data = await getTodoSummary(year, month);
      setTodoSummary((prev) => replaceMonth(prev, prefix, toSummaryMap(data)));
    } catch {
      /* summary dots are non-critical */
    }
  }, []);

  /** Fetch a month once; later calls for the same month are no-ops. */
  const ensureMonth = useCallback((year: number, month: number) => {
    const key = monthKey(year, month);
    if (loaded.current.has(key)) return;
    loaded.current.add(key);
    const prefix = `${key}-`;
    getEntries(year, month)
      .then((res) => {
        const fresh: EntryMap = {};
        res.entries.forEach((e) => { fresh[e.date] = e.dayType; });
        setEntryMap((prev) => replaceMonth(prev, prefix, fresh));
      })
      .catch(() => loaded.current.delete(key));
    void loadTodoMonth(year, month);
  }, [loadTodoMonth]);

  const updateEntry = useCallback((date: string, dayType: DayType | null) => {
    setEntryMap((prev) => ({ ...prev, [date]: dayType }));
  }, []);

  const removeEntry = useCallback((date: string) => {
    setEntryMap((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  }, []);

  const updateTodoSummary = useCallback((date: string, todos: Todo[]) => {
    setTodoSummary((prev) => {
      if (todos.length === 0) {
        const next = { ...prev };
        delete next[date];
        return next;
      }
      return { ...prev, [date]: todos.every((t) => t.completed || t.cancelled) };
    });
  }, []);

  /** Re-fetch task summaries for every month loaded so far (e.g. after moving a task). */
  const refreshTodoSummary = useCallback(() => {
    loaded.current.forEach((key) => {
      const [y, m] = key.split('-').map(Number);
      void loadTodoMonth(y, m);
    });
  }, [loadTodoMonth]);

  return { entryMap, todoSummary, ensureMonth, updateEntry, removeEntry, updateTodoSummary, refreshTodoSummary };
}
