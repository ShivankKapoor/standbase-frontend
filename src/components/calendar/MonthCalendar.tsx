import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { DayCell } from './DayCell';
import type { EntryOverview } from '../../types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MonthCalendarProps {
  year: number;
  month: number;
  entries: EntryOverview[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function MonthCalendar({ year, month, entries, selectedDate, onSelectDate, onPrev, onNext }: MonthCalendarProps) {
  const entryMap = new Map(entries.map((e) => [e.date, e.dayType]));

  const firstDay = new Date(year, month - 1, 1);
  const startOffset = firstDay.getDay(); // Sunday = 0
  const daysInMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-base font-semibold">
          {format(firstDay, 'MMMM yyyy')}
        </h2>
        <Button variant="ghost" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px border rounded-lg overflow-hidden bg-border">
        {cells.map((day, i) => {
          if (!day) {
            const col = i % 7;
            const emptyWeekend = col === 0 || col === 6;
            return <div key={i} className={`min-h-12 sm:min-h-28 ${emptyWeekend ? 'bg-muted/20' : 'bg-background'}`} />;
          }
          const date = toDateStr(year, month, day);
          const col = i % 7; // 0=Sun … 6=Sat
          const isWeekend = col === 0 || col === 6;
          return (
            <div key={date} className={isWeekend ? 'bg-muted/20' : 'bg-background'}>
              <DayCell
                day={day}
                isToday={date === todayStr}
                isSelected={date === selectedDate}
                hasEntry={entryMap.has(date)}
                dayType={entryMap.get(date) ?? null}
                onClick={() => onSelectDate(date)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
