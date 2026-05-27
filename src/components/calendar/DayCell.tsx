import type { DayType } from '../../types';

const dotColour: Record<DayType, string> = {
  PTO:      'bg-sky-500',
  PLANNING: 'bg-violet-500',
  SUPPORT:  'bg-red-500',
};

interface DayCellProps {
  day: number;
  isToday: boolean;
  isSelected: boolean;
  hasEntry: boolean;
  dayType: DayType | null;
  onClick: () => void;
}

export function DayCell({ day, isToday, isSelected, hasEntry, dayType, onClick }: DayCellProps) {
  const dot = hasEntry
    ? dayType
      ? <span className={`mt-1 h-1.5 w-1.5 rounded-full ${dotColour[dayType]}`} />
      : <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#FF6319]" />
    : null;

  return (
    <button
      onClick={onClick}
      className={[
        'group relative flex w-full min-h-9 sm:min-h-20 lg:min-h-28 xl:min-h-32 flex-col items-start p-1 sm:p-2 text-left transition-colors',
        isSelected ? 'bg-accent ring-2 ring-inset ring-primary' : 'hover:bg-accent/40',
      ].join(' ')}
    >
      <span className={[
        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
        isToday ? 'bg-primary text-primary-foreground' : 'text-foreground',
      ].join(' ')}>
        {day}
      </span>
      {dot}
    </button>
  );
}
