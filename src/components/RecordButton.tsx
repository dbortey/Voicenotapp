import { Mic, Square } from 'lucide-react';

interface RecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function RecordButton({ isRecording, isProcessing, onStart, onStop }: RecordButtonProps) {
  const handleClick = () => {
    if (isRecording) {
      onStop();
    } else if (!isProcessing) {
      onStart();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-8 pt-4 px-4 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pointer-events-none">
      <div className="max-w-4xl mx-auto flex justify-center pointer-events-auto">
        <button
          onClick={handleClick}
          disabled={isProcessing}
          className={`group relative w-20 h-20 rounded-full shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            isRecording
              ? 'bg-gradient-to-br from-red-500 to-pink-600 scale-110 animate-pulse'
              : 'bg-gradient-to-br from-violet-500 to-purple-600 hover:scale-110 hover:shadow-violet-500/50'
          }`}
        >
          {/* Outer ring animation when recording */}
          {isRecording && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
              <div className="absolute inset-0 rounded-full bg-red-500/30 animate-pulse" />
            </>
          )}
          
          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {isRecording ? (
              <Square className="w-8 h-8 text-white fill-white" />
            ) : (
              <Mic className="w-9 h-9 text-white" />
            )}
          </div>

          {/* Ripple effect on hover */}
          {!isRecording && (
            <div className="absolute inset-0 rounded-full bg-violet-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
          )}
        </button>
      </div>

      {/* Hint text */}
      {!isRecording && !isProcessing && (
        <p className="text-center text-slate-500 text-sm mt-3">
          Tap to record (max 60 seconds)
        </p>
      )}
    </div>
  );
}
