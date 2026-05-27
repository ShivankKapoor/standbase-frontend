import { apiFetch } from './client';
import type { Entry, EntryOverview, DayType } from '../types';

interface EntryListResponse {
  status: string;
  entries: EntryOverview[];
}

export function getEntries(year: number, month: number): Promise<EntryListResponse> {
  return apiFetch(`/entry?year=${year}&month=${month}`);
}

export function getEntry(date: string): Promise<Entry> {
  return apiFetch(`/entry/${date}`);
}

export function createEntry(date: string, content: string, dayType: DayType | null): Promise<Entry> {
  return apiFetch('/entry', {
    method: 'POST',
    body: JSON.stringify({ date, content, dayType }),
  });
}

export function deleteEntry(date: string): Promise<void> {
  return apiFetch(`/entry/${date}`, { method: 'DELETE' });
}
