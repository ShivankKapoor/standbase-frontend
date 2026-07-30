import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, NotebookPen, ListTodo } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { DayCell } from './DayCell';
import type { EntryOverview } from '../../types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MonthCalendarProps {
  year: number;
  month: number;
  entries: EntryOverview[];
  todoSummary: Record<string, boolean>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

interface ContextMenuState {
  date: string;
  x: number;
  y: number;
}

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function MonthCalendar({ year, month, entries, todoSummary, selectedDate, onSelectDate, onPrev, onNext, onToday }: MonthCalendarProps) {
  const navigate = useNavigate();
  const entryMap = new Map(entries.map((e) => [e.date, e.dayType]));
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const firstDay = new Date(year, month - 1, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  useEffect(() => {
    if (!contextMenu) return;
    function handleDismiss(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent && e.key !== 'Escape') return;
      setContextMenu(null);
    }
    window.addEventListener('click', handleDismiss);
    window.addEventListener('keydown', handleDismiss);
    return () => {
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('keydown', handleDismiss);
    };
  }, [contextMenu]);

  // Clamp menu position so it never overflows the viewport
  function clampedPosition(x: number, y: number) {
    const menuW = 180;
    const menuH = 88;
    return {
      left: Math.min(x, window.innerWidth - menuW - 8),
      top: Math.min(y, window.innerHeight - menuH - 8),
    };
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-xl font-semibold">
          {format(firstDay, 'MMMM yyyy')}
        </h2>
        <Button variant="outline" size="sm" className="text-xs" onClick={onToday}>
          Today
        </Button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      <div className="grid flex-1 min-h-0 grid-cols-7 [grid-auto-rows:1fr] gap-px border rounded-lg overflow-hidden bg-border">
        {cells.map((day, i) => {
          const col = i % 7;
          const isWeekend = col === 0 || col === 6;
          if (!day) {
            return <div key={i} className="bg-background" />;
          }
          const date = toDateStr(year, month, day);
          const hasTodo = date in todoSummary;
          const todoStatus = hasTodo ? (todoSummary[date] ? 'done' : 'pending') : null;
          return (
            <div
              key={date}
              className="h-full bg-background"
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ date, x: e.clientX, y: e.clientY });
              }}
            >
              <DayCell
                day={day}
                isToday={date === todayStr}
                isSelected={date === selectedDate}
                isWeekend={isWeekend}
                hasEntry={entryMap.has(date)}
                dayType={entryMap.get(date) ?? null}
                todoStatus={todoStatus}
                onClick={() => onSelectDate(date)}
              />
            </div>
          );
        })}
      </div>

      {contextMenu && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', ...clampedPosition(contextMenu.x, contextMenu.y) }}
          className="z-50 min-w-[176px] rounded-md border bg-popover p-1 shadow-md animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-left text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => { navigate(`/entry/${contextMenu.date}`); setContextMenu(null); }}
          >
            <NotebookPen className="h-3.5 w-3.5 text-muted-foreground" />
            Open Standup
          </button>
          <button
            className="flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-left text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => { navigate(`/todos/${contextMenu.date}`); setContextMenu(null); }}
          >
            <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
            Open Tasks
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
