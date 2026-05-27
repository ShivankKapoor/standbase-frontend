import { useCallback, useEffect, useState } from 'react';
import { getEntries } from '../api/entries';
import type { EntryOverview } from '../types';

export function useEntries(year: number, month: number) {
  const [entries, setEntries] = useState<EntryOverview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEntries(year, month);
      setEntries(res.entries);
    } catch {
      setError('Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetch(); }, [fetch]);

  function updateEntry(date: string, dayType: EntryOverview['dayType']) {
    setEntries((prev) => {
      const existing = prev.find((e) => e.date === date);
      if (existing) return prev.map((e) => e.date === date ? { ...e, dayType } : e);
      return [...prev, { date, dayType }];
    });
  }

  function removeEntry(date: string) {
    setEntries((prev) => prev.filter((e) => e.date !== date));
  }

  return { entries, loading, error, refresh: fetch, updateEntry, removeEntry };
}
