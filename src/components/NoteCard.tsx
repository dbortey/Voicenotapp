import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Trash2, Calendar, Clock } from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { Note } from '../types';
import { formatRelativeDate, formatTime } from '../utils/dateFormat';

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onDelete }: NoteCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!waveformRef.current || !note.audioUrl) return;

    // Initialize WaveSurfer
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#8b5cf6',
      progressColor: '#a78bfa',
      cursorColor: '#c4b5fd',
      barWidth: 3,
      barRadius: 3,
      cursorWidth: 2,
      height: 60,
      barGap: 2,
      normalize: true,
      backend: 'WebAudio',
    });

    wavesurfer.load(note.audioUrl);

    wavesurfer.on('finish', () => {
      setIsPlaying(false);
    });

    wavesurfer.on('play', () => {
      setIsPlaying(true);
    });

    wavesurfer.on('pause', () => {
      setIsPlaying(false);
    });

    wavesurferRef.current = wavesurfer;

    return () => {
      wavesurfer.destroy();
    };
  }, [note.audioUrl]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(note.id);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 hover:border-violet-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/10">
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-semibold text-slate-100 mb-3 pr-8">
          {note.title || 'Untitled Note'}
        </h3>

        {/* Waveform */}
        <div
          ref={waveformRef}
          className="mb-4 cursor-pointer rounded-lg overflow-hidden bg-slate-950/50"
          onClick={handlePlayPause}
        />

        {/* Controls */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePlayPause}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 transition-colors text-violet-300 hover:text-violet-200"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span className="text-sm font-medium">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Play</span>
              </>
            )}
          </button>

          <button
            onClick={handleDelete}
            className={`p-2 rounded-xl transition-colors ${
              showDeleteConfirm
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400'
            }`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          {/* Reminder */}
          {note.reminderDatetime ? (
            <div className="flex items-center gap-2 text-sm text-violet-400">
              <Calendar className="w-4 h-4" />
              <span>Reminder: {formatRelativeDate(note.reminderDatetime)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>No reminder set</span>
            </div>
          )}

          {/* Created date */}
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Recorded {formatRelativeDate(note.createdAt)}</span>
          </div>
        </div>

        {/* Transcript preview */}
        {note.transcript && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-sm text-slate-400 line-clamp-3">
              {note.transcript}
            </p>
          </div>
        )}
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm flex items-center justify-center">
          <p className="text-red-300 font-medium">Tap again to delete</p>
        </div>
      )}
    </div>
  );
}
