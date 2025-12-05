import { useState, useEffect } from 'react';
import { Mic, RefreshCw } from 'lucide-react';
import { RecordButton } from './components/RecordButton';
import { NoteCard } from './components/NoteCard';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { useNotes } from './hooks/useNotes';
import { getUserId } from './utils/userId';
import { syncOfflineNotes } from './utils/sync';
import { Toaster, toast } from 'sonner@2.0.3';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const { notes, loading, refreshNotes, deleteNote } = useNotes();
  const { 
    isRecording, 
    recordingTime, 
    startRecording, 
    stopRecording,
    isProcessing 
  } = useAudioRecorder(refreshNotes);

  useEffect(() => {
    // Apply dark mode
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Request notification permission on load
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Initialize user ID (cookie + IP)
    getUserId();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncOfflineNotes();
      await refreshNotes();
      toast.success('Notes synced successfully!');
    } catch (error) {
      toast.error('Failed to sync notes');
      console.error('Sync error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePullToRefresh = async () => {
    await handleSync();
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'dark bg-slate-950' : 'bg-slate-50'
    }`}>
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              MindFat
            </h1>
          </div>
          
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-slate-300 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-32 pt-8">
        {/* Status Message */}
        {isProcessing && (
          <div className="mb-6 p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-violet-500 border-t-transparent" />
              <p className="text-violet-300">Processing your voice note...</p>
            </div>
          </div>
        )}

        {/* Recording Timer */}
        {isRecording && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30 backdrop-blur-xl">
            <div className="flex items-center justify-center gap-4">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-3xl font-mono font-bold text-white">
                {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:
                {(recordingTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <p className="text-center text-red-200 mt-2">Recording... (max 60s)</p>
          </div>
        )}

        {/* Notes List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
              <Mic className="w-10 h-10 text-slate-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-300 mb-2">No voice notes yet</h2>
            <p className="text-slate-500">Tap the microphone button to record your first note</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={deleteNote}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Record Button */}
      <RecordButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        onStart={startRecording}
        onStop={stopRecording}
      />
    </div>
  );
}
