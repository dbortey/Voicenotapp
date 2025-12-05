import Dexie, { Table } from 'dexie';
import { Note } from '../types';

// IndexedDB for offline storage using Dexie

class MindFatDatabase extends Dexie {
  notes!: Table<Note>;

  constructor() {
    super('MindFatDB');
    this.version(1).stores({
      notes: 'id, userId, createdAt, reminderDatetime',
    });
  }
}

export const db = new MindFatDatabase();

export async function saveNoteOffline(note: Note): Promise<void> {
  // Convert audio blob to base64 for storage
  if (note.audioBlob) {
    const base64Audio = await blobToBase64(note.audioBlob);
    await db.notes.put({
      ...note,
      audioBlob: base64Audio as any, // Store as base64 string
    });
  } else {
    await db.notes.put(note);
  }
}

export async function getNotesOffline(): Promise<Note[]> {
  const notes = await db.notes.orderBy('createdAt').reverse().toArray();
  
  // Convert base64 back to blob URLs for playback
  return Promise.all(notes.map(async (note) => {
    if (typeof note.audioBlob === 'string') {
      const blob = await base64ToBlob(note.audioBlob as any);
      return {
        ...note,
        audioUrl: URL.createObjectURL(blob),
        audioBlob: blob,
      };
    }
    return note;
  }));
}

export async function deleteNoteOffline(id: string): Promise<void> {
  await db.notes.delete(id);
}

export async function getAllOfflineNotes(): Promise<Note[]> {
  return db.notes.toArray();
}

export async function clearOfflineNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

// Helper functions
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string): Promise<Blob> {
  return fetch(base64).then(res => res.blob());
}
