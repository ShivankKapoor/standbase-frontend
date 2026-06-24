import { useCallback, useEffect, useState } from 'react';
import {
  getTodos,
  createTodo as apiCreate,
  updateTodo as apiUpdate,
  deleteTodo as apiDelete,
  reorderTodos as apiReorder,
} from '../api/todos';
import type { Todo } from '../types';

export function useTodos(date: string | null) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!date) {
      setTodos([]);
      setFetched(false);
      return;
    }
    let cancelled = false;
    setFetched(false);
    setLoading(true);
    getTodos(date)
      .then((data) => {
        if (!cancelled) { setTodos(data); setFetched(true); }
      })
      .catch(() => {
        if (!cancelled) { setTodos([]); setFetched(true); }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [date]);

  const addTodo = useCallback(async (content: string) => {
    if (!date) return;
    const todo = await apiCreate(date, content);
    setTodos((prev) => [...prev, todo]);
  }, [date]);

  const toggleTodo = useCallback(async (id: string, completed: boolean) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed } : t));
    try {
      await apiUpdate(id, { completed });
    } catch {
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !completed } : t));
    }
  }, []);

  const removeTodo = useCallback(async (id: string) => {
    let snapshot: Todo | undefined;
    setTodos((prev) => {
      snapshot = prev.find((t) => t.id === id);
      return prev.filter((t) => t.id !== id);
    });
    try {
      await apiDelete(id);
    } catch {
      if (snapshot) {
        const s = snapshot;
        setTodos((prev) => [...prev, s].sort((a, b) => a.position - b.position));
      }
    }
  }, []);

  const reorderTodo = useCallback(async (newOrder: Todo[]) => {
    let snapshot: Todo[] = [];
    setTodos((prev) => { snapshot = prev; return newOrder; });
    try {
      const updated = await apiReorder(newOrder.map((t) => t.id));
      setTodos(updated);
    } catch {
      setTodos(snapshot);
    }
  }, []);

  return { todos, loading, fetched, addTodo, toggleTodo, removeTodo, reorderTodo };
}
