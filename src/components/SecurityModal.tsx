import React from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  Server, 
  Database, 
  Key, 
  CheckCircle2, 
  AlertTriangle,
  FileCode,
  Layers
} from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden text-stone-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">Security, Threat Model & Data Isolation</h2>
              <p className="text-xs text-stone-500">Comprehensive overview of system protections</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-stone-700 leading-relaxed">
          {/* Threat Model Table */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-stone-700" />
              Agentic Threat Modeling Matrix
            </h3>
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-stone-100 text-stone-800 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="p-2.5">Threat Zone</th>
                    <th className="p-2.5">Potential Risk</th>
                    <th className="p-2.5">Implemented Countermeasure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr className="bg-white">
                    <td className="p-2.5 font-medium text-stone-900">1. Input Surfaces</td>
                    <td className="p-2.5 text-stone-600">Prompt injection, payload corruption, oversize inputs</td>
                    <td className="p-2.5 text-stone-800">Defensive null-safe deserialization, 10MB payload limit, input sanitization</td>
                  </tr>
                  <tr className="bg-stone-50/50">
                    <td className="p-2.5 font-medium text-stone-900">2. Planning & Reasoning</td>
                    <td className="p-2.5 text-stone-600">System prompt bypass, instruction hijacking</td>
                    <td className="p-2.5 text-stone-800">Clear separation of system instructions and user journal context in LLM pipeline</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2.5 font-medium text-stone-900">3. Tool & AI Execution</td>
                    <td className="p-2.5 text-stone-600">Model outages, 429 rate limits, 503 unavailable</td>
                    <td className="p-2.5 text-stone-800">Automated fallback ladder (gemini-3.6-flash → gemini-3.1-flash-lite → dynamic)</td>
                  </tr>
                  <tr className="bg-stone-50/50">
                    <td className="p-2.5 font-medium text-stone-900">4. Memory & State</td>
                    <td className="p-2.5 text-stone-600">Cross-user data leakage, unauthorized read/write</td>
                    <td className="p-2.5 text-stone-800">Strict Firestore Security Rules enforcing <code>request.auth.uid == userId</code></td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2.5 font-medium text-stone-900">5. Secret Management</td>
                    <td className="p-2.5 text-stone-600">Client-side API key leakage in browser network tab</td>
                    <td className="p-2.5 text-stone-800">Zero-hardcoded secrets. GEMINI_API_KEY resides strictly on backend Express server</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Firestore Security Rules Block */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-stone-700" />
              Active Firestore Security Rules (Owner-Bound)
            </h3>
            <div className="bg-stone-900 text-stone-100 p-3.5 rounded-xl font-mono text-[11px] overflow-x-auto">
              <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`}</pre>
            </div>
          </div>

          {/* Key Security Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-emerald-950">Federated Authentication</div>
                <p className="text-[11px] text-emerald-800">
                  Google Sign-In via Firebase Auth. No plaintext passwords stored.
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-blue-950">Strict Undefined-Stripping</div>
                <p className="text-[11px] text-blue-800">
                  All payloads pass through recursive null/undefined sanitizers to avoid Firestore runtime errors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-stone-50 hover:bg-stone-800 rounded-lg text-xs font-semibold transition"
          >
            Close Security Specifications
          </button>
        </div>
      </div>
    </div>
  );
};
