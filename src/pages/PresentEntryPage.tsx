import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { format, parseISO } from 'date-fns';
import { X, Minus, Plus, Glasses } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getEntry } from '../api/entries';
import '@fontsource/opendyslexic/400.css';
import '@fontsource/opendyslexic/700.css';

const MIN_SIZE = 1.5;
const MAX_SIZE = 6;
const STEP = 0.25;
const DEFAULT_SIZE = 2.25;

export function PresentEntryPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialContent = (state as { content?: string } | null)?.content;

  const [content, setContent] = useState(initialContent ?? '');
  const [loading, setLoading] = useState(initialContent === undefined);
  const [fontSize, setFontSize] = useState(() => {
    const stored = Number(localStorage.getItem('present_font_size'));
    return stored >= MIN_SIZE && stored <= MAX_SIZE ? stored : DEFAULT_SIZE;
  });
  const [dyslexicFont, setDyslexicFont] = useState(
    () => localStorage.getItem('present_dyslexic_font') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('present_font_size', String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('present_dyslexic_font', String(dyslexicFont));
  }, [dyslexicFont]);

  useEffect(() => {
    if (!date || initialContent !== undefined) return;
    setLoading(true);
    getEntry(date)
      .then((entry) => setContent(entry.content ?? ''))
      .catch(() => setContent(''))
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') navigate(-1);
      else if (e.key === '+' || e.key === '=') setFontSize((s) => Math.min(MAX_SIZE, s + STEP));
      else if (e.key === '-' || e.key === '_') setFontSize((s) => Math.max(MIN_SIZE, s - STEP));
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const parsedDate = date ? parseISO(date) : null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-semibold">
            {parsedDate ? format(parsedDate, 'EEEE') : ''}
          </span>
          <span className="text-xs text-muted-foreground">
            {parsedDate ? format(parsedDate, 'd MMMM yyyy') : ''}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Decrease text size"
            onClick={() => setFontSize((s) => Math.max(MIN_SIZE, s - STEP))}
            disabled={fontSize <= MIN_SIZE}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Increase text size"
            onClick={() => setFontSize((s) => Math.min(MAX_SIZE, s + STEP))}
            disabled={fontSize >= MAX_SIZE}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle OpenDyslexic font"
            aria-pressed={dyslexicFont}
            className={dyslexicFont ? 'bg-accent text-accent-foreground' : ''}
            onClick={() => setDyslexicFont((d) => !d)}
          >
            <Glasses className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Exit present mode" onClick={() => navigate(-1)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-auto px-8 py-10">
        {loading ? (
          <div className="m-auto h-10 w-64 animate-pulse rounded bg-muted" />
        ) : content.trim() ? (
          <p
            className="m-auto w-full max-w-7xl whitespace-pre-wrap text-center font-bold leading-snug tracking-wide"
            style={{
              fontSize: `${fontSize}rem`,
              fontFamily: dyslexicFont ? "'OpenDyslexic', sans-serif" : undefined,
            }}
          >
            {content}
          </p>
        ) : (
          <p className="m-auto text-lg text-muted-foreground">Nothing to present for this entry.</p>
        )}
      </div>
    </div>
  );
}
