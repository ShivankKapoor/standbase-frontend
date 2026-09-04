import { apiFetch } from './client';
import type { HeatMapResponse } from '../types';

export function getHeatMap(today: string): Promise<HeatMapResponse> {
  return apiFetch(`/heatmap?today=${today}`);
}
