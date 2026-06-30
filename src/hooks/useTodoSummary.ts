import { useCallback, useEffect, useState } from 'react';
import { getTodoSummary } from '../api/todos';
import type { Todo } from '../types';

export function useTodoSummary(year: number, month: number) {
  const [summaryMap, setSummaryMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSummaryMap({});
    let cancelled = false;
    getTodoSummary(year, month)
      .then((data) => {
        if (!cancelled) {
          const map: Record<string, boolean> = {};
          data.forEach((s) => { map[s.date] = s.allCompleted; });
          setSummaryMap(map);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [year, month]);

  const updateTodoSummary = useCallback((date: string, todos: Todo[]) => {
    setSummaryMap((prev) => {
      if (todos.length === 0) {
        const next = { ...prev };
        delete next[date];
        return next;
      }
      return { ...prev, [date]: todos.every((t) => t.completed) };
    });
  }, []);

  const refresh = useCallback(async () => {
    getTodoSummary(year, month)
      .then((data) => {
        const map: Record<string, boolean> = {};
        data.forEach((s) => { map[s.date] = s.allCompleted; });
        setSummaryMap(map);
      })
      .catch(() => {});
  }, [year, month]);

  return { summaryMap, updateTodoSummary, refresh };
}
