import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Copy, 
  Check, 
  PlusCircle, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Compass,
  ListTodo
} from 'lucide-react';
import type { ChatMessage, JournalEntry } from '../types';

interface ReflectionChatProps {
  entry: JournalEntry;
  onUpdateTurns: (newTurns: ChatMessage[]) => void;
  onAppendToContent: (text: string) => void;
}

export const ReflectionChat: React.FC<ReflectionChatProps> = ({
  entry,
  onUpdateTurns,
  onAppendToContent,
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<'reflective' | 'brainstorm' | 'actionable' | 'summary'>('reflective');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [entry.turns, isLoading]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    setError(null);
    setInputMessage('');

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      text: textToSend,
      timestamp: Date.now(),
    };

    const updatedHistory = [...(entry.turns || []), userMessage];
    onUpdateTurns(updatedHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: updatedHistory.slice(0, -1), // Prior messages
          mode: chatMode,
          entryContext: {
            title: entry.title,
            category: entry.category,
            mood: entry.mood,
            content: entry.content,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const modelMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'model',
        text: data.text,
        timestamp: Date.now(),
        modelUsed: data.modelUsed,
      };

      onUpdateTurns([...updatedHistory, modelMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err?.message || 'Error communicating with Gemini AI. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestionPrompts = [
    { label: 'Deep Inquiries', text: 'What questions should I ask myself to gain deeper clarity on this reflection?', icon: HelpCircle },
    { label: 'Brainstorm Ideas', text: 'Help me brainstorm 4 creative alternative perspectives on this situation.', icon: Lightbulb },
    { label: 'Action Steps', text: 'Translate this reflection into 3 immediate, high-impact action items.', icon: ListTodo },
    { label: 'Spot Patterns', text: 'What subtle themes, assumptions, or cognitive biases do you notice in my thoughts?', icon: Compass },
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l border-stone-200 text-stone-800">
      {/* Chat header */}
      <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-xs text-stone-900">Gemini Reflection Partner</h3>
            <p className="text-[10px] text-stone-500">Multi-turn context on this entry</p>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-1 bg-stone-200/80 p-0.5 rounded-lg text-[10px] font-medium">
          <button
            onClick={() => setChatMode('reflective')}
            className={`px-2 py-1 rounded-md transition-colors ${
              chatMode === 'reflective' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Inquiry
          </button>
          <button
            onClick={() => setChatMode('brainstorm')}
            className={`px-2 py-1 rounded-md transition-colors ${
              chatMode === 'brainstorm' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Ideate
          </button>
          <button
            onClick={() => setChatMode('actionable')}
            className={`px-2 py-1 rounded-md transition-colors ${
              chatMode === 'actionable' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Actions
          </button>
        </div>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {(!entry.turns || entry.turns.length === 0) ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-xs">
              <p className="text-xs font-semibold text-stone-800">Start a Reflection Conversation</p>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Gemini analyzes your written entry and provides tailored feedback, deep inquiry, or actionable ideas.
              </p>
            </div>

            {/* Suggestion prompt chips */}
            <div className="w-full space-y-2 pt-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 text-left">
                Suggested Prompts
              </div>
              {suggestionPrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    id={`chat-prompt-${idx}`}
                    onClick={() => handleSendMessage(item.text)}
                    disabled={isLoading}
                    className="w-full text-left p-2.5 rounded-lg border border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-700 text-xs transition-colors flex items-start gap-2.5 group"
                  >
                    <Icon className="w-4 h-4 text-stone-500 mt-0.5 shrink-0 group-hover:text-amber-600" />
                    <div>
                      <div className="font-semibold text-stone-900 text-[11px]">{item.label}</div>
                      <div className="text-[11px] text-stone-500 line-clamp-1">{item.text}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          entry.turns.map((turn) => {
            const isModel = turn.role === 'model';
            return (
              <div
                key={turn.id}
                className={`flex gap-2.5 ${isModel ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    isModel ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-stone-900 text-white'
                  }`}
                >
                  {isModel ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed space-y-2 ${
                    isModel
                      ? 'bg-stone-50 border border-stone-200/90 text-stone-800'
                      : 'bg-stone-900 text-stone-50 font-normal'
                  }`}
                >
                  <div className="prose prose-xs max-w-none text-xs text-inherit break-words">
                    <ReactMarkdown>{turn.text}</ReactMarkdown>
                  </div>

                  {/* Message meta & actions */}
                  {isModel && (
                    <div className="flex items-center justify-between pt-1 text-[10px] text-stone-400 border-t border-stone-200/60">
                      <span>{turn.modelUsed || 'gemini-3.6-flash'}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(turn.text, turn.id)}
                          title="Copy text"
                          className="hover:text-stone-700 transition flex items-center gap-1"
                        >
                          {copiedId === turn.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => onAppendToContent(`\n\n### AI Reflection Insight\n${turn.text}`)}
                          title="Append to journal entry"
                          className="hover:text-stone-700 transition flex items-center gap-1"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>Append</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <div className="flex items-center gap-2 p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-stone-600">
            <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
            <span>ReflectAI is synthesizing your thoughts and preparing response...</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">AI Interaction Error</p>
              <p>{error}</p>
              <button
                onClick={() => handleSendMessage()}
                className="text-[11px] underline font-medium text-rose-900 hover:text-rose-700"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt quick bar if conversation already active */}
      {entry.turns && entry.turns.length > 0 && (
        <div className="px-4 py-2 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto bg-stone-50/50">
          <span className="text-[10px] text-stone-400 whitespace-nowrap">Quick:</span>
          <button
            onClick={() => handleSendMessage('What are 2 constructive questions to ask myself now?')}
            disabled={isLoading}
            className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 whitespace-nowrap"
          >
            Reflective Questions
          </button>
          <button
            onClick={() => handleSendMessage('Help me break this down into next action steps.')}
            disabled={isLoading}
            className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 whitespace-nowrap"
          >
            Action Steps
          </button>
          <button
            onClick={() => handleSendMessage('Summarize our discussion so far into 3 takeaways.')}
            disabled={isLoading}
            className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 whitespace-nowrap"
          >
            Key Takeaways
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="p-3 border-t border-stone-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="chat-user-input"
            type="text"
            placeholder="Ask Gemini about your reflection..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition"
          />
          <button
            id="chat-send-button"
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
