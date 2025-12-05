// Sync offline notes to Supabase

import { getAllOfflineNotes, clearOfflineNote } from '../services/dexie';
import { saveNote } from '../services/supabase';

export async function syncOfflineNotes(): Promise<void> {
  const offlineNotes = await getAllOfflineNotes();

  if (offlineNotes.length === 0) {
    return;
  }

  console.log(`Syncing ${offlineNotes.length} offline notes...`);

  for (const note of offlineNotes) {
    try {
      await saveNote(note);
      await clearOfflineNote(note.id);
      console.log(`Synced note ${note.id}`);
    } catch (error) {
      console.error(`Failed to sync note ${note.id}:`, error);
      // Keep the note in offline storage and continue
    }
  }

  console.log('Sync completed');
}

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Connection restored, syncing...');
    syncOfflineNotes().catch(console.error);
  });
}
