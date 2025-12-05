import { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { getNotes, deleteNote as deleteNoteFromSupabase } from '../services/supabase';
import { getNotesOffline, deleteNoteOffline } from '../services/dexie';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshNotes = useCallback(async () => {
    setLoading(true);
    try {
      // Try to load from Supabase first
      const supabaseNotes = await getNotes();
      
      if (supabaseNotes.length > 0) {
        setNotes(supabaseNotes);
      } else {
        // Fallback to offline notes
        const offlineNotes = await getNotesOffline();
        setNotes(offlineNotes);
      }
    } catch (error) {
      console.error('Error loading notes from Supabase, using offline:', error);
      // Load from offline storage
      const offlineNotes = await getNotesOffline();
      setNotes(offlineNotes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshNotes();
  }, [refreshNotes]);

  const deleteNote = async (id: string) => {
    try {
      await deleteNoteFromSupabase(id);
      await deleteNoteOffline(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      // Still try to delete from offline storage
      await deleteNoteOffline(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    }
  };

  return {
    notes,
    loading,
    refreshNotes,
    deleteNote,
  };
}
