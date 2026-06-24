import { apiFetch } from './client';
import type { Todo, TodoSummary } from '../types';

export function getTodos(date: string): Promise<Todo[]> {
  return apiFetch(`/todos?date=${date}`);
}

export function createTodo(entryDate: string, content: string): Promise<Todo> {
  return apiFetch('/todos', {
    method: 'POST',
    body: JSON.stringify({ entryDate, content }),
  });
}

export function updateTodo(id: string, patch: { content?: string; completed?: boolean }): Promise<Todo> {
  return apiFetch(`/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  });
}

export function deleteTodo(id: string): Promise<void> {
  return apiFetch(`/todos/${id}`, { method: 'DELETE' });
}

export function reorderTodos(ids: string[]): Promise<Todo[]> {
  return apiFetch('/todos/reorder', {
    method: 'PUT',
    body: JSON.stringify({ ids }),
  });
}

export function getTodoSummary(year: number, month: number): Promise<TodoSummary[]> {
  return apiFetch(`/todos/summary?year=${year}&month=${month}`);
}
