import { useEffect, useState } from 'react';
import { addMonths, format, getDaysInMonth, isSameMonth, setDate } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { getCreditMonth } from '../../api/credits';
import { formatCredits } from '../../lib/credits';
import type { CreditMonth } from '../../types';

function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function DailyChart({ month, data }: { month: Date; data: CreditMonth }) {
  const [active, setActive] = useState<number | null>(null);
  const usage = new Map(
    data.days.filter((d) => d.used !== null).map((d) => [Number(d.date.slice(8)), d.used as number]),
  );
  const max = Math.max(...usage.values(), 0);
  const days = Array.from({ length: getDaysInMonth(month) }, (_, i) => i + 1);
  const describe = (day: number) => {
    const used = usage.get(day);
    return `${format(setDate(month, day), 'EEE, MMM d')} · ${used === undefined ? 'no total logged' : `${formatCredits(used)} used`}`;
  };

  return (
    <div>
      <div className="mb-1 text-xs text-muted-foreground tabular-nums">{formatCredits(max)}</div>
      <div className="flex h-40 items-end gap-0.5 border-t border-b" onMouseLeave={() => setActive(null)}>
        {days.map((day) => {
          const used = usage.get(day) ?? 0;
          return (
            <button
              key={day}
              type="button"
              aria-label={describe(day)}
              className="flex h-full min-w-0 flex-1 items-end justify-center rounded-sm hover:bg-muted focus-visible:bg-muted"
              onMouseEnter={() => setActive(day)}
              onFocus={() => setActive(day)}
              onClick={() => setActive(day)}
            >
              <span
                className="w-full max-w-6 rounded-t bg-primary"
                style={{ height: max ? `${(used / max) * 100}%` : 0 }}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{format(month, 'MMM')} 1</span>
        <span>{format(month, 'MMM')} {days.length}</span>
      </div>
      <p className="mt-2 min-h-5 text-sm" aria-live="polite">
        {active ? describe(active) : <span className="text-muted-foreground">Hover or tap a day to see its usage</span>}
      </p>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-muted-foreground">Show as table</summary>
        <table className="mt-2 tabular-nums">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pr-6 font-normal">Date</th>
              <th className="pr-6 text-right font-normal">Total</th>
              <th className="text-right font-normal">Used</th>
            </tr>
          </thead>
          <tbody>
            {data.days.map((d) => (
              <tr key={d.date}>
                <td className="pr-6">{format(setDate(month, Number(d.date.slice(8))), 'EEE, MMM d')}</td>
                <td className="pr-6 text-right">{d.monthTotal === null ? "Didn't work" : formatCredits(d.monthTotal)}</td>
                <td className="text-right">{d.used === null ? '—' : formatCredits(d.used)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

export function CreditUsageCard({ today }: { today: Date }) {
  const [month, setMonth] = useState(() => setDate(today, 1));
  const [result, setResult] = useState<{ month: Date; data: CreditMonth | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCreditMonth(month.getFullYear(), month.getMonth() + 1)
      .then((data) => { if (!cancelled) setResult({ month, data }); })
      .catch(() => { if (!cancelled) setResult({ month, data: null }); });
    return () => { cancelled = true; };
  }, [month]);

  const loading = result?.month !== month;
  const data = loading ? null : result.data;

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle>AI credits</CardTitle>
          <CardDescription>Daily usage, worked out from your month-to-date totals</CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Previous month" onClick={() => setMonth(addMonths(month, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="w-32 text-center text-sm">{format(month, 'MMMM yyyy')}</span>
          <Button variant="ghost" size="icon" aria-label="Next month" onClick={() => setMonth(addMonths(month, 1))} disabled={isSameMonth(month, today)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!loading && !data && <p className="text-sm text-destructive">Failed to load credit data</p>}
        {data && data.days.every((d) => d.monthTotal === null) && (
          <p className="text-sm text-muted-foreground">No credit totals logged this month</p>
        )}
        {data && data.days.some((d) => d.monthTotal !== null) && (
          <>
            <div className="flex flex-wrap gap-8">
              <Figure label="Used" value={formatCredits(data.used)} />
              <Figure label="Average per worked day" value={data.average === null ? '—' : formatCredits(data.average)} />
              <Figure label="Days worked" value={`${data.workedDays}`} />
            </div>
            <DailyChart key={month.getTime()} month={month} data={data} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
