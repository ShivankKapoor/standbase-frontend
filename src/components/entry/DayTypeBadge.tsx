import type { DayType } from '../../types';

const styles: Record<DayType, string> = {
  PTO:      'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  PLANNING: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400',
  SUPPORT:  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

const dotStyles: Record<DayType, string> = {
  PTO:      'bg-sky-500',
  PLANNING: 'bg-violet-500',
  SUPPORT:  'bg-amber-500',
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
