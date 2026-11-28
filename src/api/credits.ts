import { apiFetch } from './client';
import type { CreditMonth } from '../types';

export function getCreditMonth(year: number, month: number): Promise<CreditMonth> {
  return apiFetch(`/credits?year=${year}&month=${month}`);
}

export function saveCreditDay(date: string, monthTotal: number | null, didNotWork: boolean): Promise<CreditMonth> {
  return apiFetch(`/credits/${date}`, {
    method: 'PUT',
    body: JSON.stringify({ monthTotal, didNotWork }),
  });
}
