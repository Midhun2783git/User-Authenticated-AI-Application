import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Save, 
  Star, 
  Trash2, 
  Tag, 
  Smile, 
  Folder, 
  BrainCircuit, 
  ListChecks, 
  Lightbulb, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  ArrowLeft,
  Share2,
  FileText,
  Clock
} from 'lucide-react';
import type { JournalEntry, EntryCategory, MoodType, ChatMessage } from '../types';
import { ReflectionChat } from './ReflectionChat';
import { formatDate } from '../utils/sanitize';

interface EntryEditorProps {
  entry: JournalEntry;
  onSave: (entry: JournalEntry) => Promise<void>;
  onDelete: (entryId: string) => Promise<void>;
  onBack: () => void;
  isSaving: boolean;
  saveError: string | null;
  onClearSaveError: () => void;
}

const CATEGORIES: { id: EntryCategory; label: string }[] = [
  { id: 'personal', label: 'Personal Growth' },
  { id: 'work', label: 'Work & Projects' },
  { id: 'gratitude', label: 'Gratitude' },
  { id: 'mindfulness', label: 'Mindfulness & Health' },
  { id: 'brainstorm', label: 'Brainstorm & Ideas' },
  { id: 'learning', label: 'Learning & Notes' },
];

const MOODS: { id: MoodType; label: string; emoji: string }[] = [
  { id: 'calm', label: 'Calm', emoji: '🌿' },
  { id: 'reflective', label: 'Reflective', emoji: '🪞' },
  { id: 'thoughtful', label: 'Thoughtful', emoji: '💭' },
  { id: 'inspired', label: 'Inspired', emoji: '✨' },
  { id: 'energized', label: 'Energized', emoji: '⚡' },
  { id: 'focused', label: 'Focused', emoji: '🎯' },
  { id: 'grateful', label: 'Grateful', emoji: '🙏' },
  { id: 'anxious', label: 'Anxious / Stressed', emoji: '🌧️' },
];

export const EntryEditor: React.FC<EntryEditorProps> = ({
  entry: initialEntry,
  onSave,
  onDelete,
  onBack,
  isSaving,
  saveError,
  onClearSaveError,
}) => {
  const [currentEntry, setCurrentEntry] = useState<JournalEntry>(initialEntry);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(true);

  // Sync state if entry prop changes
  useEffect(() => {
    setCurrentEntry(initialEntry);
    setHasUnsavedChanges(false);
  }, [initialEntry.id]);

  const updateField = <K extends keyof JournalEntry>(key: K, value: JournalEntry[K]) => {
    setCurrentEntry((prev) => ({
      ...prev,
      [key]: value,
      updatedAt: Date.now(),
    }));
    setHasUnsavedChanges(true);
    onClearSaveError();
  };

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().toLowerCase().replace(/^#/, '');
    if (trimmed && !currentEntry.tags?.includes(trimmed)) {
      updateField('tags', [...(currentEntry.tags || []), trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateField('tags', (currentEntry.tags || []).filter((t) => t !== tagToRemove));
  };

  const handleTriggerAnalysis = async () => {
    if (!currentEntry.content.trim()) {
      setAnalysisError('Please write some thoughts in your journal before running AI analysis.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentEntry.title,
          content: currentEntry.content,
          category: currentEntry.category,
          mood: currentEntry.mood,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze entry');
      }

      // Merge analysis results into current entry
      const existingTags = new Set(currentEntry.tags || []);
      if (Array.isArray(data.suggestedTags)) {
        data.suggestedTags.forEach((t: string) => existingTags.add(t));
      }

      const updated: JournalEntry = {
        ...currentEntry,
        summary: data.summary,
        insights: data.insights || [],
        actionItems: data.actionItems || [],
        tags: Array.from(existingTags),
        mood: currentEntry.mood || data.detectedMood,
        updatedAt: Date.now(),
      };

      setCurrentEntry(updated);
      setHasUnsavedChanges(true);

      // Auto-save the enriched entry
      await onSave(updated);
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisError(err?.message || 'Error generating AI analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualSave = async () => {
    try {
      await onSave(currentEntry);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleChatTurnsUpdate = async (newTurns: ChatMessage[]) => {
    const updated: JournalEntry = {
      ...currentEntry,
      turns: newTurns,
      updatedAt: Date.now(),
    };
    setCurrentEntry(updated);
    setHasUnsavedChanges(true);
    // Persist conversation turns directly
    await onSave(updated);
    setHasUnsavedChanges(false);
  };

  const handleAppendText = (textToAppend: string) => {
    const newContent = `${currentEntry.content}${textToAppend}`;
    updateField('content', newContent);
  };

  // Word count & read time
  const wordCount = currentEntry.content.trim() ? currentEntry.content.trim().split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-4rem)] flex flex-col">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            id="editor-back-button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 px-2.5 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Archive</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>Created {formatDate(currentEntry.createdAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {readTimeMinutes} min read ({wordCount} words)
            </span>
          </div>
        </div>

        {/* Save Status & Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Status Indicator */}
          <div className="text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-md">
            {isSaving ? (
              <span className="text-stone-500 flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </span>
            ) : saveError ? (
              <span className="text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" /> Save failed
              </span>
            ) : hasUnsavedChanges ? (
              <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-medium">
                Unsaved changes
              </span>
            ) : (
              <span className="text-emerald-700 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved to Firestore
              </span>
            )}
          </div>

          <button
            id="editor-star-button"
            onClick={() => updateField('starred', !currentEntry.starred)}
            className={`p-2 rounded-lg border transition-colors ${
              currentEntry.starred
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-800'
            }`}
            title={currentEntry.starred ? 'Starred reflection' : 'Star this reflection'}
          >
            <Star className={`w-4 h-4 ${currentEntry.starred ? 'fill-amber-500' : ''}`} />
          </button>

          <button
            id="toggle-chat-panel-button"
            onClick={() => setShowChatPanel(!showChatPanel)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              showChatPanel
                ? 'bg-stone-900 text-stone-50 border-stone-900'
                : 'border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>AI Dialogue ({currentEntry.turns?.length || 0})</span>
          </button>

          <button
            id="editor-save-button"
            onClick={handleManualSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 disabled:opacity-50 text-xs font-medium shadow-xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          <button
            id="editor-delete-button"
            onClick={() => {
              if (window.confirm('Are you sure you want to permanently delete this journal entry?')) {
                onDelete(currentEntry.id);
              }
            }}
            className="p-2 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
            title="Delete Entry"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {saveError && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{saveError}</span>
          </div>
          <button
            onClick={handleManualSave}
            className="font-semibold underline text-rose-900 hover:text-rose-700"
          >
            Retry Save
          </button>
        </div>
      )}

      {/* Main Workspace Split View */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Left / Center Editor Column */}
        <div className={`flex flex-col h-full overflow-y-auto space-y-4 pr-1 ${showChatPanel ? 'lg:col-span-7' : 'lg:col-span-12'}`}>
          {/* Metadata Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-stone-200/90 shadow-xs space-y-3">
            {/* Title Input */}
            <input
              id="entry-title-input"
              type="text"
              placeholder="Give your reflection a title..."
              value={currentEntry.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full text-xl font-bold text-stone-900 placeholder-stone-400 focus:outline-none border-b border-transparent focus:border-stone-300 pb-1"
            />

            {/* Category & Mood Selectors */}
            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              {/* Category */}
              <div className="flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-stone-400" />
                <select
                  id="entry-category-select"
                  value={currentEntry.category}
                  onChange={(e) => updateField('category', e.target.value as EntryCategory)}
                  className="bg-stone-50 border border-stone-200 rounded-md px-2 py-1 text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mood */}
              <div className="flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-stone-400" />
                <select
                  id="entry-mood-select"
                  value={currentEntry.mood || ''}
                  onChange={(e) => updateField('mood', (e.target.value || undefined) as MoodType)}
                  className="bg-stone-50 border border-stone-200 rounded-md px-2 py-1 text-stone-700 focus:outline-none focus:ring-1 focus:ring-stone-400"
                >
                  <option value="">Select Mood (Optional)</option>
                  {MOODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.emoji} {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Management */}
              <div className="flex-1 flex flex-wrap items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                {currentEntry.tags?.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] border border-stone-200"
                  >
                    #{t}
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-600 font-bold ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder="+ tag"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-16 px-1.5 py-0.5 text-[11px] bg-transparent border-b border-stone-200 focus:border-stone-500 focus:outline-none text-stone-700"
                />
              </div>
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1 min-h-[300px] bg-white rounded-xl border border-stone-200/90 shadow-xs p-4 flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 mb-2">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Personal Journal & Reflection
              </span>
              <button
                id="ai-analyze-button"
                onClick={handleTriggerAnalysis}
                disabled={isAnalyzing || !currentEntry.content.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 disabled:opacity-50 text-xs font-semibold shadow-xs transition-colors"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
                ) : (
                  <BrainCircuit className="w-3.5 h-3.5 text-amber-700" />
                )}
                <span>Generate AI Insights & Summary</span>
              </button>
            </div>

            <textarea
              id="entry-content-textarea"
              placeholder="What is on your mind today? Write freely about events, decisions, dilemmas, emotional states, or creative ideas..."
              value={currentEntry.content}
              onChange={(e) => updateField('content', e.target.value)}
              className="flex-1 w-full text-sm text-stone-800 placeholder-stone-400 focus:outline-none resize-none leading-relaxed min-h-[220px]"
            />
          </div>

          {analysisError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{analysisError}</div>
            </div>
          )}

          {/* AI Synthesis Box (Summary, Insights, Action Items) */}
          {(currentEntry.summary || (currentEntry.insights && currentEntry.insights.length > 0)) && (
            <div className="bg-gradient-to-br from-amber-50/70 via-stone-50 to-white rounded-xl border border-amber-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-amber-200/80 text-amber-900 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="font-semibold text-xs text-stone-900">
                    Gemini 3.6 Synthesis & Cognitive Insights
                  </h4>
                </div>
                <span className="text-[10px] text-stone-500 font-mono bg-white px-2 py-0.5 rounded border border-stone-200">
                  Auto-Extracted
                </span>
              </div>

              {/* Summary */}
              {currentEntry.summary && (
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-950">
                    Executive Summary
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed bg-white/80 p-3 rounded-lg border border-amber-100">
                    {currentEntry.summary}
                  </p>
                </div>
              )}

              {/* Insights List */}
              {currentEntry.insights && currentEntry.insights.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-700" />
                    Key Cognitive Insights
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {currentEntry.insights.map((insight, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-stone-700 bg-white/80 p-3 rounded-lg border border-amber-100 flex items-start gap-2"
                      >
                        <span className="font-bold text-amber-700">{idx + 1}.</span>
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Items */}
              {currentEntry.actionItems && currentEntry.actionItems.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-amber-700" />
                    Constructive Action Items & Inquiries
                  </div>
                  <div className="space-y-1.5">
                    {currentEntry.actionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-stone-700 bg-white/80 p-2.5 rounded-lg border border-amber-100 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Multi-Turn Chat Panel */}
        {showChatPanel && (
          <div className="lg:col-span-5 h-full rounded-xl overflow-hidden border border-stone-200 shadow-xs flex flex-col bg-white">
            <ReflectionChat
              entry={currentEntry}
              onUpdateTurns={handleChatTurnsUpdate}
              onAppendToContent={handleAppendText}
            />
          </div>
        )}
      </div>
    </div>
  );
};
