import { useEffect, useMemo, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { buildHeatmapWeeks, type HeatmapBucket, type HeatmapCell } from '../../lib/heatmap';
import type { HeatMapEntry } from '../../types';

interface HeatmapCalendarProps {
  entries: HeatMapEntry[];
}

const BUCKET_CLASS: Record<HeatmapBucket, string> = {
  0: 'bg-muted',
  1: 'bg-heat-1',
  2: 'bg-heat-2',
  3: 'bg-heat-3',
  4: 'bg-heat-4',
};

const MIN_CELL_SIZE = 10;
const MAX_CELL_SIZE = 20;
const GAP = 4;

function getMonthLabels(weeks: HeatmapCell[][]): (string | null)[] {
  let lastMonth = -1;
  return weeks.map((week) => {
    const firstDay = week.find((cell) => cell !== null);
    if (!firstDay) return null;
    const month = parseISO(firstDay.date).getMonth();
    if (month === lastMonth) return null;
    lastMonth = month;
    return format(parseISO(firstDay.date), 'MMM');
  });
}

/** Cell size that fills the container's width (up to a sane cap), recalculated as it resizes. */
function useCellSize(containerRef: React.RefObject<HTMLDivElement | null>, columnCount: number) {
  const [cellSize, setCellSize] = useState(MIN_CELL_SIZE);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || columnCount === 0) return;

    const observer = new ResizeObserver(([entry]) => {
      const availableWidth = entry.contentRect.width - GAP * (columnCount - 1);
      const size = Math.floor(availableWidth / columnCount);
      setCellSize(Math.min(MAX_CELL_SIZE, Math.max(MIN_CELL_SIZE, size)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef, columnCount]);

  return cellSize;
}

export function HeatmapCalendar({ entries }: HeatmapCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const today = useMemo(() => new Date(), []);
  const weeks = useMemo(() => buildHeatmapWeeks(entries, today), [entries, today]);
  const monthLabels = useMemo(() => getMonthLabels(weeks), [weeks]);
  const cellSize = useCellSize(containerRef, weeks.length);

  return (
    <div ref={containerRef} className="flex w-full overflow-x-auto overflow-y-visible pb-2">
      <div className="m-auto flex flex-col gap-1">
        <div className="flex gap-1">
          {monthLabels.map((label, i) => (
            <div key={i} style={{ width: cellSize }} className="text-[10px] text-muted-foreground">
              {label}
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((cell, di) => (
                <div key={di} className="group relative" style={{ width: cellSize, height: cellSize }}>
                  {cell && (
                    <>
                      <div
                        className={[
                          'absolute inset-0 rounded-full transition-transform duration-150 ease-out group-hover:scale-150',
                          BUCKET_CLASS[cell.bucket],
                        ].join(' ')}
                      />
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 translate-y-1 scale-90 whitespace-nowrap rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground opacity-0 shadow-md transition-all duration-150 ease-out group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100">
                        <span className="font-medium">{format(parseISO(cell.date), 'EEEE, MMM d, yyyy')}</span>
                        <span className="text-muted-foreground"> · {cell.wordCount} word{cell.wordCount === 1 ? '' : 's'}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
