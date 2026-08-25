/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  subscribeToAuth, 
  signInWithGoogle, 
  logOut, 
  subscribeToUserEntries, 
  saveJournalEntry, 
  deleteJournalEntry 
} from './firebase';
import type { UserProfile, JournalEntry } from './types';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { HistoryView } from './components/HistoryView';
import { EntryEditor } from './components/EntryEditor';
import { InsightsDashboard } from './components/InsightsDashboard';
import { SecurityModal } from './components/SecurityModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentView, setCurrentView] = useState<'history' | 'editor' | 'insights'>('history');
  const [activeEntry, setActiveEntry] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // 1. Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Subscribe to user's isolated Firestore entries when logged in
  useEffect(() => {
    if (!currentUser?.uid) {
      setEntries([]);
      return;
    }

    const unsubscribe = subscribeToUserEntries(
      currentUser.uid,
      (userEntries) => {
        setEntries(userEntries);
      },
      (err) => {
        console.error('Failed to subscribe to entries:', err);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Auth Handlers
  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await logOut();
    setActiveEntry(null);
    setCurrentView('history');
  };

  // Create new entry
  const handleNewEntry = () => {
    if (!currentUser) return;
    const newEntry: JournalEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUser.uid,
      title: '',
      content: '',
      category: 'personal',
      tags: [],
      turns: [],
      starred: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setActiveEntry(newEntry);
    setCurrentView('editor');
  };

  // Select existing entry
  const handleSelectEntry = (entry: JournalEntry) => {
    setActiveEntry(entry);
    setCurrentView('editor');
  };

  // Save entry to Firestore
  const handleSaveEntry = async (entryToSave: JournalEntry) => {
    if (!currentUser?.uid) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      await saveJournalEntry(currentUser.uid, entryToSave);
      // Update local state if it's the active one
      if (activeEntry?.id === entryToSave.id) {
        setActiveEntry(entryToSave);
      }
    } catch (err: any) {
      console.error('Failed to save journal entry to Firestore:', err);
      setSaveError(err?.message || 'Failed to save entry to Firestore. Please retry.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle star status
  const handleToggleStar = async (entry: JournalEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser?.uid) return;
    const updated: JournalEntry = {
      ...entry,
      starred: !entry.starred,
      updatedAt: Date.now(),
    };
    try {
      await saveJournalEntry(currentUser.uid, updated);
    } catch (err) {
      console.error('Failed to update star state:', err);
    }
  };

  // Delete entry
  const handleDeleteEntry = async (entryId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser?.uid) return;

    try {
      await deleteJournalEntry(currentUser.uid, entryId);
      if (activeEntry?.id === entryId) {
        setActiveEntry(null);
        setCurrentView('history');
      }
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  // Initial Auth Loading Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-stone-600">
          <Loader2 className="w-8 h-8 animate-spin text-stone-800" />
          <p className="text-xs font-medium tracking-wide">Initializing secure session...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, render Landing Page
  if (!currentUser) {
    return (
      <>
        <LandingPage 
          onSignIn={handleSignIn} 
          onOpenSecurityModal={() => setIsSecurityModalOpen(true)} 
        />
        <SecurityModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
        />
      </>
    );
  }

  // Main Authenticated Workspace
  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col selection:bg-amber-200 selection:text-stone-900">
      {/* Global Navbar */}
      <Navbar
        user={currentUser}
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          if (view !== 'editor') {
            setActiveEntry(null);
          }
        }}
        onNewEntry={handleNewEntry}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onSignOut={handleSignOut}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        entriesCount={entries.length}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'editor' && activeEntry ? (
          <EntryEditor
            entry={activeEntry}
            onSave={handleSaveEntry}
            onDelete={(id) => handleDeleteEntry(id)}
            onBack={() => {
              setActiveEntry(null);
              setCurrentView('history');
            }}
            isSaving={isSaving}
            saveError={saveError}
            onClearSaveError={() => setSaveError(null)}
          />
        ) : currentView === 'insights' ? (
          <InsightsDashboard
            entries={entries}
            onBack={() => setCurrentView('history')}
            onSelectEntry={handleSelectEntry}
          />
        ) : (
          <HistoryView
            entries={entries}
            onSelectEntry={handleSelectEntry}
            onNewEntry={handleNewEntry}
            onToggleStar={handleToggleStar}
            onDeleteEntry={handleDeleteEntry}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}
      </main>

      {/* Security Specifications Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
    </div>
  );
}
