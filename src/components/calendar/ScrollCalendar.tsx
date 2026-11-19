import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { DayCell } from './DayCell';
import type { DayType } from '../../types';

const LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS_BEFORE = 18;
const MONTHS_AFTER = 18;

interface MonthRef {
  year: number;
  month: number; // 1-12
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

interface MonthBlockProps {
  year: number;
  month: number;
  isCurrentMonth: boolean;
  todayStr: string;
  entryMap: Record<string, DayType | null>;
  todoSummary: Record<string, boolean>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  blockRef: (el: HTMLElement | null) => void;
}

const MonthBlock = memo(function MonthBlock({
  year, month, isCurrentMonth, todayStr, entryMap, todoSummary, selectedDate, onSelectDate, blockRef,
}: MonthBlockProps) {
  const startOffset = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  // Like iOS: the month name sits above the 1st; for late-week starts there isn't room, so it goes right.
  const labelFits = startOffset <= 4;

  return (
    <section ref={blockRef} className="border-t border-border/60 px-1 pb-3">
      <div className="grid grid-cols-7">
        <h3
          className={[
            'px-2 pt-2 pb-1 text-xl font-bold',
            isCurrentMonth ? 'text-primary' : 'text-foreground',
            labelFits ? '' : 'text-right',
          ].join(' ')}
          style={{ gridColumn: labelFits ? `${startOffset + 1} / -1` : '1 / -1' }}
        >
          {format(new Date(year, month - 1, 1), 'MMMM')}
        </h3>
        {Array.from({ length: startOffset }, (_, i) => <div key={`pad-${i}`} aria-hidden />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = toDateStr(year, month, day);
          const col = (startOffset + i) % 7;
          const hasTodo = date in todoSummary;
          return (
            <div key={date}>
              <DayCell
                day={day}
                isToday={date === todayStr}
                isSelected={date === selectedDate}
                isWeekend={col === 0 || col === 6}
                hasEntry={date in entryMap}
                dayType={entryMap[date] ?? null}
                todoStatus={hasTodo ? (todoSummary[date] ? 'done' : 'pending') : null}
                onClick={() => onSelectDate(date)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
});

interface ScrollCalendarProps {
  entryMap: Record<string, DayType | null>;
  todoSummary: Record<string, boolean>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  ensureMonth: (year: number, month: number) => void;
}

/** Mobile calendar: one continuous vertical scroll through months, like the iPhone Calendar app. */
export function ScrollCalendar({ entryMap, todoSummary, selectedDate, onSelectDate, ensureMonth }: ScrollCalendarProps) {
  const [now] = useState(() => new Date());
  const todayStr = toDateStr(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const months = useMemo<MonthRef[]>(() => {
    const base = now.getFullYear() * 12 + now.getMonth();
    return Array.from({ length: MONTHS_BEFORE + 1 + MONTHS_AFTER }, (_, i) => {
      const idx = base - MONTHS_BEFORE + i;
      return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
    });
  }, [now]);
  const currentIdx = MONTHS_BEFORE;

  const scrollRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLElement | null)[]>([]);
  const frame = useRef(0);
  const [visibleYear, setVisibleYear] = useState(now.getFullYear());

  const update = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const top = scroller.scrollTop + 8;
    let idx = 0;
    for (let i = 0; i < months.length; i++) {
      const el = blockRefs.current[i];
      if (el && el.offsetTop <= top) idx = i; else break;
    }
    setVisibleYear(months[idx].year);
    // Load what's on screen plus a little either side.
    for (let i = Math.max(0, idx - 1); i <= Math.min(months.length - 1, idx + 2); i++) {
      ensureMonth(months[i].year, months[i].month);
    }
  }, [months, ensureMonth]);

  function scrollToCurrent(smooth: boolean) {
    const el = blockRefs.current[currentIdx];
    scrollRef.current?.scrollTo({ top: el ? el.offsetTop : 0, behavior: smooth ? 'smooth' : 'auto' });
  }

  useLayoutEffect(() => {
    scrollToCurrent(false);
    update();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  function handleScroll() {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(update);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col animate-fade-in">
      <div className="shrink-0 px-2">
        <div className="flex h-11 items-center justify-between">
          <span className="px-2 text-2xl font-bold text-primary">{visibleYear}</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-primary"
            onClick={() => scrollToCurrent(true)}
          >
            Today
          </Button>
        </div>
        <div className="grid grid-cols-7 px-1 pb-1">
          {LETTERS.map((d, i) => (
            <div key={i} className="py-1 text-center text-[11px] font-medium text-muted-foreground">
              {d}
            </div>
          ))}
        </div>
      </div>

      <div ref={scrollRef} onScroll={handleScroll} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain pb-safe">
        {months.map((m, i) => (
          <MonthBlock
            key={`${m.year}-${m.month}`}
            year={m.year}
            month={m.month}
            isCurrentMonth={i === currentIdx}
            todayStr={todayStr}
            entryMap={entryMap}
            todoSummary={todoSummary}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            blockRef={(el) => { blockRefs.current[i] = el; }}
          />
        ))}
      </div>
    </div>
  );
}
