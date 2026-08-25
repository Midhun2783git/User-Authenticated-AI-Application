import React from 'react';
import { 
  BarChart3, 
  Sparkles, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Smile, 
  Folder, 
  Award,
  ArrowLeft
} from 'lucide-react';
import type { JournalEntry } from '../types';

interface InsightsDashboardProps {
  entries: JournalEntry[];
  onBack: () => void;
  onSelectEntry: (entry: JournalEntry) => void;
}

export const InsightsDashboard: React.FC<InsightsDashboardProps> = ({
  entries,
  onBack,
  onSelectEntry,
}) => {
  // Aggregate stats
  const totalEntries = entries.length;
  const totalTurns = entries.reduce((acc, e) => acc + (e.turns?.length || 0), 0);
  const totalStarred = entries.filter((e) => e.starred).length;
  const totalSynthesized = entries.filter((e) => !!e.summary).length;

  // Category counts
  const categoryCounts: Record<string, number> = {};
  entries.forEach((e) => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  // Mood counts
  const moodCounts: Record<string, number> = {};
  entries.forEach((e) => {
    if (e.mood) {
      moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
    }
  });

  // Top active reflections
  const topActive = [...entries]
    .sort((a, b) => (b.turns?.length || 0) - (a.turns?.length || 0))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Journal</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Reflection Insights & Analytics</h1>
            <p className="text-xs text-stone-500">Your journaling trends and AI synthesis metrics</p>
          </div>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Total Reflections</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-900">{totalEntries}</div>
          <p className="text-[11px] text-stone-500">Isolated in Cloud Firestore</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">AI Dialogue Turns</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-900">{totalTurns}</div>
          <p className="text-[11px] text-stone-500">Multi-turn Gemini conversations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Synthesized Entries</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-900">{totalSynthesized}</div>
          <p className="text-[11px] text-stone-500">With AI summary & action items</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-medium uppercase tracking-wider">Starred Insights</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="text-3xl font-bold text-stone-900">{totalStarred}</div>
          <p className="text-[11px] text-stone-500">Bookmarked key reflections</p>
        </div>
      </div>

      {/* Category Breakdown & Mood Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Categories */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-stone-600" />
            <h3 className="font-bold text-sm text-stone-900">Reflections by Category</h3>
          </div>

          <div className="space-y-3">
            {Object.keys(categoryCounts).length > 0 ? (
              Object.entries(categoryCounts).map(([cat, count]) => {
                const percent = Math.round((count / Math.max(1, totalEntries)) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span className="capitalize">{cat}</span>
                      <span>
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-stone-900 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-stone-400">No categories recorded yet.</p>
            )}
          </div>
        </div>

        {/* Mood Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Smile className="w-4 h-4 text-stone-600" />
            <h3 className="font-bold text-sm text-stone-900">Emotional Landscape & Moods</h3>
          </div>

          <div className="space-y-3">
            {Object.keys(moodCounts).length > 0 ? (
              Object.entries(moodCounts).map(([mood, count]) => {
                const percent = Math.round((count / Math.max(1, totalEntries)) * 100);
                return (
                  <div key={mood} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-stone-700">
                      <span className="capitalize">{mood}</span>
                      <span>
                        {count} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-stone-400">No mood data recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Deepest Conversations */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-stone-600" />
          <h3 className="font-bold text-sm text-stone-900">Most Explored AI Reflections</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topActive.map((entry) => (
            <div
              key={entry.id}
              onClick={() => onSelectEntry(entry)}
              className="p-4 rounded-xl border border-stone-200 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50 cursor-pointer transition-all space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  {entry.category}
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  {entry.turns?.length || 0} dialogue turns
                </span>
              </div>
              <h4 className="font-bold text-stone-900 text-sm line-clamp-1">
                {entry.title || 'Untitled Entry'}
              </h4>
              <p className="text-xs text-stone-600 line-clamp-2">{entry.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
