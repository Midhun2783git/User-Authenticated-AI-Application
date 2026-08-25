import React from 'react';
import { 
  Star, 
  MessageSquare, 
  Trash2, 
  Sparkles, 
  Calendar, 
  ArrowRight,
  Lightbulb,
  CheckCircle2
} from 'lucide-react';
import type { JournalEntry } from '../types';
import { formatDate, getRelativeTime } from '../utils/sanitize';

interface EntryCardProps {
  entry: JournalEntry;
  onSelect: (entry: JournalEntry) => void;
  onToggleStar: (entry: JournalEntry, e: React.MouseEvent) => void;
  onDelete: (entryId: string, e: React.MouseEvent) => void;
}

const MOOD_EMOJIS: Record<string, string> = {
  calm: '🌿 Calm',
  reflective: '🪞 Reflective',
  thoughtful: '💭 Thoughtful',
  inspired: '✨ Inspired',
  energized: '⚡ Energized',
  focused: '🎯 Focused',
  grateful: '🙏 Grateful',
  anxious: '🌧️ Anxious',
};

const CATEGORY_COLORS: Record<string, string> = {
  personal: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  work: 'bg-blue-50 text-blue-700 border-blue-200',
  gratitude: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  mindfulness: 'bg-teal-50 text-teal-700 border-teal-200',
  brainstorm: 'bg-amber-50 text-amber-800 border-amber-200',
  learning: 'bg-purple-50 text-purple-700 border-purple-200',
};

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  onSelect,
  onToggleStar,
  onDelete,
}) => {
  const turnsCount = entry.turns?.length || 0;
  const hasAIInsights = !!(entry.summary || (entry.insights && entry.insights.length > 0));

  return (
    <div
      id={`entry-card-${entry.id}`}
      onClick={() => onSelect(entry)}
      className="group bg-white rounded-xl border border-stone-200/90 hover:border-stone-400 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 relative"
    >
      {/* Card Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                CATEGORY_COLORS[entry.category] || 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              {entry.category.toUpperCase()}
            </span>

            {entry.mood && (
              <span className="text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                {MOOD_EMOJIS[entry.mood] || entry.mood}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={(e) => onToggleStar(entry, e)}
              className={`p-1.5 rounded-md transition-colors ${
                entry.starred
                  ? 'text-amber-500 hover:text-amber-600'
                  : 'text-stone-300 hover:text-stone-500'
              }`}
              title={entry.starred ? 'Starred reflection' : 'Star this'}
            >
              <Star className={`w-4 h-4 ${entry.starred ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={(e) => onDelete(entry.id, e)}
              className="p-1.5 rounded-md text-stone-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete reflection"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-stone-900 text-base group-hover:text-stone-950 transition-colors line-clamp-1">
          {entry.title || 'Untitled Reflection'}
        </h3>

        {/* Content excerpt */}
        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
          {entry.content || 'No text content.'}
        </p>
      </div>

      {/* AI Summary Snippet (if available) */}
      {entry.summary && (
        <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg p-2.5 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-900 uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-amber-700" />
            <span>AI Synthesis</span>
          </div>
          <p className="text-[11px] text-stone-700 line-clamp-2 leading-tight">
            {entry.summary}
          </p>
        </div>
      )}

      {/* Tags */}
      {entry.tags && entry.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 pt-1">
          {entry.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-stone-500 bg-stone-50 px-1.5 py-0.5 rounded border border-stone-200"
            >
              #{tag}
            </span>
          ))}
          {entry.tags.length > 3 && (
            <span className="text-[10px] text-stone-400">+{entry.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Card Footer */}
      <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Calendar className="w-3.5 h-3.5 text-stone-400" />
          <span>{getRelativeTime(entry.updatedAt || entry.createdAt)}</span>
        </div>

        <div className="flex items-center gap-3">
          {turnsCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded-full">
              <MessageSquare className="w-3 h-3 text-stone-500" />
              {turnsCount} {turnsCount === 1 ? 'turn' : 'turns'}
            </span>
          )}

          <div className="text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all">
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};
