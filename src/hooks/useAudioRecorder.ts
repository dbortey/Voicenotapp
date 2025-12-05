import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { transcribeAudio } from '../services/assemblyai';
import { extractInfo } from '../services/extraction';
import { saveNote } from '../services/supabase';
import { saveNoteOffline } from '../services/dexie';
import { getUserId } from '../utils/userId';
import { scheduleReminder } from '../utils/notifications';
import { v4 as uuidv4 } from 'uuid';

const MAX_RECORDING_TIME = 60; // seconds

export function useAudioRecorder(onComplete: () => void) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);

        if (seconds >= MAX_RECORDING_TIME) {
          stopRecording();
        }
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to access microphone. Please grant permission.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  const processRecording = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      const noteId = uuidv4();
      const userId = await getUserId();

      // Create local audio URL
      const audioUrl = URL.createObjectURL(audioBlob);

      // Step 1: Transcribe with AssemblyAI
      toast.info('Transcribing audio...');
      const transcript = await transcribeAudio(audioBlob);

      if (!transcript) {
        throw new Error('Transcription failed');
      }

      // Step 2: Extract info using spaCy backend
      toast.info('Extracting information...');
      const { title, reminderDatetime } = await extractInfo(transcript);

      // Step 3: Save to Supabase
      const note = {
        id: noteId,
        userId,
        audioUrl,
        audioBlob,
        title: title || 'Untitled Note',
        reminderDatetime,
        transcript,
        createdAt: new Date().toISOString(),
      };

      try {
        await saveNote(note);
        toast.success('Voice note saved!');

        // Schedule reminder if datetime is set
        if (reminderDatetime) {
          await scheduleReminder(noteId, title || 'Reminder', reminderDatetime);
        }
      } catch (supabaseError) {
        console.error('Supabase save failed, saving offline:', supabaseError);
        // Fallback to offline storage
        await saveNoteOffline(note);
        toast.warning('Saved offline. Will sync when online.');
      }

      onComplete();
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error('Failed to process recording. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isRecording,
    recordingTime,
    isProcessing,
    startRecording,
    stopRecording,
  };
}
