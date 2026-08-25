import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  BookOpen, 
  Download, 
  Sparkles, 
  Calendar,
  Layers,
  Smile,
  FileJson,
  FileText
} from 'lucide-react';
import type { JournalEntry, EntryCategory, MoodType } from '../types';
import { EntryCard } from './EntryCard';

interface HistoryViewProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  onToggleStar: (entry: JournalEntry, e: React.MouseEvent) => void;
  onDeleteEntry: (entryId: string, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const CATEGORY_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Entries' },
  { id: 'personal', label: 'Personal' },
  { id: 'work', label: 'Work' },
  { id: 'gratitude', label: 'Gratitude' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'brainstorm', label: 'Ideas' },
  { id: 'learning', label: 'Learning' },
];

export const HistoryView: React.FC<HistoryViewProps> = ({
  entries,
  onSelectEntry,
  onNewEntry,
  onToggleStar,
  onDeleteEntry,
  searchQuery,
  onSearchChange,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [onlyStarred, setOnlyStarred] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'turns'>('updated');

  // Filtered & Sorted Entries
  const filteredEntries = useMemo(() => {
    return entries
      .filter((entry) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = entry.title?.toLowerCase().includes(q);
          const matchContent = entry.content?.toLowerCase().includes(q);
          const matchSummary = entry.summary?.toLowerCase().includes(q);
          const matchTags = entry.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchContent && !matchSummary && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && entry.category !== selectedCategory) {
          return false;
        }

        // Mood filter
        if (selectedMood !== 'all' && entry.mood !== selectedMood) {
          return false;
        }

        // Starred only
        if (onlyStarred && !entry.starred) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'created') {
          return (b.createdAt || 0) - (a.createdAt || 0);
        }
        if (sortBy === 'turns') {
          return (b.turns?.length || 0) - (a.turns?.length || 0);
        }
        return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
      });
  }, [entries, searchQuery, selectedCategory, selectedMood, onlyStarred, sortBy]);

  // Export entries to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `reflectai-journal-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export entries to Markdown
  const handleExportMarkdown = () => {
    let md = `# ReflectAI Journal Archive\nExported on: ${new Date().toLocaleString()}\n\n`;
    entries.forEach((e) => {
      md += `## ${e.title || 'Untitled Entry'}\n`;
      md += `- **Date**: ${new Date(e.createdAt).toLocaleString()}\n`;
      md += `- **Category**: ${e.category} | **Mood**: ${e.mood || 'None'}\n`;
      if (e.tags && e.tags.length > 0) {
        md += `- **Tags**: ${e.tags.map((t) => `#${t}`).join(', ')}\n`;
      }
      if (e.summary) {
        md += `\n### AI Executive Summary\n${e.summary}\n`;
      }
      md += `\n### Reflection Content\n${e.content}\n\n`;
      if (e.turns && e.turns.length > 0) {
        md += `### AI Multi-Turn Dialogue (${e.turns.length} turns)\n`;
        e.turns.forEach((t) => {
          md += `**${t.role === 'model' ? 'Gemini AI' : 'User'}**: ${t.text}\n\n`;
        });
      }
      md += `---\n\n`;
    });

    const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `reflectai-journal-${new Date().toISOString().slice(0, 10)}.md`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Your Private Reflection Vault
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            All entries are isolated to your authenticated account in Cloud Firestore.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 text-xs">
            <button
              onClick={handleExportMarkdown}
              title="Export all entries as Markdown"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-stone-700 hover:bg-white transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>
            <button
              onClick={handleExportJSON}
              title="Export all entries as JSON"
              className="flex items-center gap-1 px-2.5 py-1 rounded-md text-stone-700 hover:bg-white transition-colors"
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Export .JSON</span>
            </button>
          </div>

          <button
            id="history-new-entry-button"
            onClick={onNewEntry}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 text-stone-50 hover:bg-stone-800 text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Reflection</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === tab.id
                  ? 'bg-stone-900 text-stone-50 shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub-Filters: Search input, Mood, Starred, Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="history-search-input"
                type="text"
                placeholder="Filter by title, thoughts, summary..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>

            {/* Mood selector */}
            <div className="flex items-center gap-1 text-xs">
              <Smile className="w-3.5 h-3.5 text-stone-400" />
              <select
                id="history-mood-filter"
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-stone-700 text-xs focus:outline-none"
              >
                <option value="all">All Moods</option>
                <option value="calm">🌿 Calm</option>
                <option value="reflective">🪞 Reflective</option>
                <option value="thoughtful">💭 Thoughtful</option>
                <option value="inspired">✨ Inspired</option>
                <option value="energized">⚡ Energized</option>
                <option value="focused">🎯 Focused</option>
                <option value="grateful">🙏 Grateful</option>
                <option value="anxious">🌧️ Anxious</option>
              </select>
            </div>

            {/* Starred Toggle */}
            <button
              id="history-starred-filter"
              onClick={() => setOnlyStarred(!onlyStarred)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                onlyStarred
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyStarred ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>Starred</span>
            </button>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span className="text-stone-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-stone-700 text-xs focus:outline-none"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Date Created</option>
              <option value="turns">Most AI Dialogue Turns</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Entry Cards */}
      {filteredEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onSelect={onSelectEntry}
              onToggleStar={onToggleStar}
              onDelete={onDeleteEntry}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-stone-200/90 p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-stone-900">
              {entries.length === 0 ? 'Start Your First Reflection' : 'No matching entries found'}
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              {entries.length === 0
                ? 'Capture your thoughts, challenge your perspectives, and unpack your emotions with Gemini 3.6 Flash.'
                : 'Try adjusting your search query or filters to find what you are looking for.'}
            </p>
          </div>
          <button
            id="empty-state-new-button"
            onClick={onNewEntry}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 text-stone-50 hover:bg-stone-800 text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Reflection</span>
          </button>
        </div>
      )}
    </div>
  );
};
