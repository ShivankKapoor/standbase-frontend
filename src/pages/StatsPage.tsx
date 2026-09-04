import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { format, parseISO } from 'date-fns';
import { Header } from '../components/layout/Header';
import { HeatmapCalendar } from '../components/stats/HeatmapCalendar';
import { StatTile } from '../components/stats/StatTile';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useHeatMap } from '../hooks/useHeatMap';
import { getMostWordsDay, getWeeklyAverage } from '../lib/heatmap';

export function StatsPage() {
  const navigate = useNavigate();
  const [today] = useState(() => new Date());
  const { entries, average, loading, error } = useHeatMap(today);

  const mostWordsDay = getMostWordsDay(entries);
  const weeklyAverage = getWeeklyAverage(entries, today);

  return (
    <div className="min-h-dvh bg-background">
      <Header />
      <main className="mx-auto w-full max-w-screen-2xl px-4 py-6">
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Back to calendar" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Statistics</h1>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!loading && !error && (
          <div className="flex flex-col gap-4">
            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle>Writing activity</CardTitle>
                <CardDescription>Word count per entry over the past year</CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapCalendar entries={entries} />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatTile label="Average words per entry" value={`${average}`} />
              <StatTile
                label="Longest entry"
                value={mostWordsDay ? `${mostWordsDay.wordCount} words` : '—'}
                sublabel={mostWordsDay ? format(parseISO(mostWordsDay.entryDate), 'MMM d, yyyy') : undefined}
              />
              <StatTile label="This week's average" value={`${weeklyAverage} words`} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
