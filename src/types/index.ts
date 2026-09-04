export type DayType = 'PTO' | 'PLANNING' | 'SUPPORT';

export interface EntryOverview {
  date: string;
  dayType: DayType | null;
}

export interface Entry {
  status: string;
  date: string;
  dayType: DayType | null;
  content: string | null;
}

export interface LoginResult {
  status: 'ok' | 'totp_required';
  sessionToken?: string;
  preAuthToken?: string;
}

export interface SessionCheck {
  status: string;
  userName: string;
}

export interface Todo {
  id: string;
  entryDate: string;
  content: string;
  completed: boolean;
  position: number;
}

export interface TodoSummary {
  date: string;
  allCompleted: boolean;
}

export interface HeatMapEntry {
  entryDate: string;
  wordCount: number;
}

export interface HeatMapResponse {
  status: string;
  average: number;
  entries: HeatMapEntry[];
}
