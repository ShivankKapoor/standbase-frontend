import { useEffect, useState, type FormEvent } from 'react';
import { isWeekend, parseISO } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { getCreditMonth, saveCreditDay } from '../../api/credits';
import { ApiError } from '../../api/client';
import { formatCredits } from '../../lib/credits';
import type { CreditMonth } from '../../types';

function errorMessage(err: unknown): string {
  if (err instanceof ApiError && err.status === 400) {
    try {
      const body = JSON.parse(err.message);
      return body.error ?? 'Enter a number with at most 2 decimals';
    } catch {
      // Not JSON: fall through to the generic message.
    }
  }
  return 'Failed to save credits';
}

/** Month-to-date AI credits for one day. Saves on its own, separately from the entry. */
export function CreditField({ date }: { date: string }) {
  const [month, setMonth] = useState<CreditMonth | null>(null);
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const [year, monthNumber] = date.split('-').map(Number);
    getCreditMonth(year, monthNumber)
      .then((data) => {
        if (cancelled) return;
        setMonth(data);
        setValue(data.days.find((d) => d.date === date)?.monthTotal?.toString() ?? '');
      })
      .catch(() => { if (!cancelled) toast.error('Failed to load credits'); });
    return () => { cancelled = true; };
  }, [date]);

  const day = month?.days.find((d) => d.date === date);
  const previous = month?.days.filter((d) => d.date < date && d.monthTotal !== null).at(-1)?.monthTotal ?? 0;
  const savedValue = day?.monthTotal?.toString() ?? '';
  const didNotWork = day?.didNotWork ?? false;
  const dirty = value !== savedValue;

  // Steps by whole credits, starting from the previous total when the field is empty.
  function step(by: number) {
    const base = value === '' ? previous : Number(value);
    setValue(String(Math.max(0, Math.round((base + by) * 100) / 100)));
  }

  async function save(monthTotal: number | null, off: boolean) {
    setSaving(true);
    try {
      const data = await saveCreditDay(date, monthTotal, off);
      setMonth(data);
      setValue(monthTotal?.toString() ?? '');
      toast.success(monthTotal === null && !off ? 'Credits cleared' : 'Credits saved');
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (dirty) save(value === '' ? null : Number(value), false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Label htmlFor="credits" className="text-xs uppercase tracking-wide text-muted-foreground">
        AI credits (month to date)
      </Label>
      <div className="flex items-center gap-2">
        <div className="relative w-36">
          <Input
            id="credits"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            className="pr-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder={previous ? `Last: ${formatCredits(previous)}` : 'Total so far'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!month || didNotWork}
          />
          <div className="absolute inset-y-px right-px flex w-6 flex-col border-l">
            {([[1, ChevronUp, 'Increase credits'], [-1, ChevronDown, 'Decrease credits']] as const).map(([by, Icon, label]) => (
              <button
                key={by}
                type="button"
                aria-label={label}
                tabIndex={-1}
                className="flex flex-1 items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                onClick={() => step(by)}
                disabled={!month || didNotWork}
              >
                <Icon className="h-3 w-3" />
              </button>
            ))}
          </div>
        </div>
        <Button type="submit" size="sm" variant="outline" disabled={!month || saving || !dirty}>
          Save
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => save(null, false)} disabled={saving || !day}>
          Clear
        </Button>
      </div>
      {day?.used != null && (
        <p className="text-xs text-muted-foreground">{formatCredits(day.used)} used since the previous total</p>
      )}
      {!isWeekend(parseISO(date)) && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={didNotWork}
            onChange={(e) => save(null, e.target.checked)}
            disabled={!month || saving || savedValue !== '' || value !== ''}
          />
          Didn't work
        </label>
      )}
    </form>
  );
}
