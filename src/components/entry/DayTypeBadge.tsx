import type { DayType } from '../../types';

const styles: Record<DayType, string> = {
  PTO:      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  PLANNING: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
  SUPPORT:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  MISSED:   'bg-slate-200 text-slate-700 dark:bg-slate-700/40 dark:text-slate-300',
};

const dotStyles: Record<DayType, string> = {
  PTO:      'bg-green-500',
  PLANNING: 'bg-pink-400',
  SUPPORT:  'bg-yellow-400',
  MISSED:   'bg-slate-400',
};

export function DayTypeBadge({ dayType }: { dayType: DayType }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[dayType]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[dayType]}`} />
      {dayType}
    </span>
  );
}

export { dotStyles as dayTypeDotStyles };
