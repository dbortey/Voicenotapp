import { createClient } from '@supabase/supabase-js';
import { Note } from '../types';
import { getUserId } from '../utils/userId';

// TODO: Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://your-project.supabase.co'; // TODO: Replace with your Supabase URL
const SUPABASE_ANON_KEY = 'your-anon-key'; // TODO: Replace with your Supabase anon key

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const STORAGE_BUCKET = 'voice-notes';
const TABLE_NAME = 'notes';

export async function saveNote(note: Note): Promise<void> {
  const userId = await getUserId();

  // Upload audio to Supabase Storage
  const fileName = `${userId}/${note.id}.webm`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(fileName, note.audioBlob!, {
      contentType: 'audio/webm',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Failed to upload audio: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(fileName);

  const publicAudioUrl = urlData.publicUrl;

  // Save note metadata to database
  const { error: dbError } = await supabase
    .from(TABLE_NAME)
    .insert({
      id: note.id,
      user_id: userId,
      audio_url: publicAudioUrl,
      title: note.title,
      transcript: note.transcript,
      reminder_datetime: note.reminderDatetime,
      created_at: note.createdAt,
    });

  if (dbError) {
    throw new Error(`Failed to save note: ${dbError.message}`);
  }
}

export async function getNotes(): Promise<Note[]> {
  const userId = await getUserId();

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch notes: ${error.message}`);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    audioUrl: row.audio_url,
    title: row.title,
    transcript: row.transcript,
    reminderDatetime: row.reminder_datetime,
    createdAt: row.created_at,
  }));
}

export async function deleteNote(id: string): Promise<void> {
  const userId = await getUserId();

  // Delete from storage
  const fileName = `${userId}/${id}.webm`;
  await supabase.storage.from(STORAGE_BUCKET).remove([fileName]);

  // Delete from database
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to delete note: ${error.message}`);
  }
}
