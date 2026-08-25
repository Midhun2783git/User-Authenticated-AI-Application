import React, { useState } from 'react';
import { 
  Sparkles, 
  Shield, 
  Lock, 
  BrainCircuit, 
  MessageSquare, 
  Database, 
  CheckCircle2, 
  ArrowRight,
  Loader2
} from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => Promise<void>;
  onOpenSecurityModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onOpenSecurityModal }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onSignIn();
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError(err?.message || 'Authentication failed. Please check your browser popup settings and retry.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-amber-200 selection:text-stone-900">
      {/* Navigation header */}
      <header className="border-b border-stone-200/80 bg-white/70 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold tracking-tight text-stone-900 text-base">ReflectAI</span>
              <span className="ml-2 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                Gemini 3.6 Flash
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="landing-security-button"
              onClick={onOpenSecurityModal}
              className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Security & Isolation</span>
            </button>
            <button
              id="landing-signin-header-button"
              onClick={handleSignIn}
              disabled={isLoading}
              className="flex items-center gap-2 bg-stone-900 text-stone-50 hover:bg-stone-800 disabled:opacity-50 text-xs font-medium px-4 py-2 rounded-lg transition shadow-xs"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Sign In with Google</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex-1 flex flex-col justify-center">
        {error && (
          <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-start gap-3">
            <div className="font-semibold">Sign In Notice:</div>
            <div>{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100/80 border border-amber-200/80 text-amber-900 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Multi-Turn AI Reflections & Deep Synthesis</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-900 leading-[1.15]">
              A Private Sanctuary for Thought, Clarity, and Synthesis.
            </h1>

            <p className="text-lg text-stone-600 leading-relaxed">
              Capture your raw thoughts, explore complex decisions, and converse multi-turn with 
              <span className="font-semibold text-stone-800"> Gemini 3.6 Flash</span>. All your reflections 
              are strictly isolated to your verified Firebase account with zero cross-user leakage.
            </p>

            {/* CTA action */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <button
                id="hero-signin-button"
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 text-xs text-stone-500">
                <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Passwordless federated identity. No plaintext passwords stored.</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-stone-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs text-stone-600">Owner-Bound Firestore Rules</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs text-stone-600">Server-Side Secret Isolation</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs text-stone-600">Multi-Model Resilient Ladder</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Preview Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-stone-800">Sample Active Reflection</span>
                </div>
                <span className="text-[10px] text-stone-500 font-mono bg-stone-100 px-2 py-0.5 rounded">
                  /users/uid_9x7/entries/...
                </span>
              </div>

              {/* Sample User Thought */}
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-stone-500 uppercase tracking-wider">User Journal Entry</div>
                <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-lg border border-stone-100 italic leading-relaxed">
                  "I've been feeling overwhelmed balancing our sprint deadlines with long-term architecture refactoring. I want to build sustainably without slowing down our shipping velocity."
                </p>
              </div>

              {/* Sample AI Insights */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
                  <BrainCircuit className="w-3.5 h-3.5 text-amber-600" />
                  <span>Gemini 3.6 Synthesis & Action Items</span>
                </div>
                <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5 space-y-2 text-xs text-stone-700">
                  <div className="font-medium text-amber-950">
                    💡 Insight: Tension between urgent vs. important technical debt.
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-stone-600 text-[11px]">
                    <li>Allocate a fixed 15% budget per sprint for technical maintenance.</li>
                    <li>Frame refactoring items around developer velocity metrics.</li>
                  </ul>
                </div>
              </div>

              {/* Multi-turn Chat Pill */}
              <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 bg-stone-50 px-3 py-2 rounded-lg border border-stone-100">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-stone-600" />
                  Multi-turn conversational dialogue enabled
                </span>
                <span className="font-semibold text-stone-800">3 turns active</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature pillars */}
      <section className="bg-white border-t border-stone-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">Owner-Bound Data Isolation</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Cloud Firestore security rules enforce strict read/write authorization bound directly to your authenticated UID.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
                <BrainCircuit className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">Gemini 3.6 Flash Engine</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Empathetic reasoning, intelligent pattern extraction, structured action items, and conversational follow-ups.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-800">
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">Zero-Leakage Architecture</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Backend API proxying prevents API key exposure. Strict payload sanitization ensures zero crash writes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span>ReflectAI Workspace</span>
            <span>•</span>
            <span>Google Cloud Run & Cloud Firestore</span>
          </div>
          <button
            onClick={onOpenSecurityModal}
            className="hover:text-stone-800 underline transition-colors"
          >
            Threat Model & Security Specifications
          </button>
        </div>
      </footer>
    </div>
  );
};
