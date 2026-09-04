import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { getHeatMap } from '../api/heatmap';
import type { HeatMapEntry } from '../types';

export function useHeatMap(today: Date) {
  const [entries, setEntries] = useState<HeatMapEntry[]>([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = format(today, 'yyyy-MM-dd');

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHeatMap(todayStr);
      setEntries(res.entries);
      setAverage(res.average);
    } catch {
      setError('Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => { fetch(); }, [fetch]);

  return { entries, average, loading, error, refresh: fetch };
}
