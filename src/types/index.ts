export interface Note {
  id: string;
  userId: string;
  audioUrl: string;
  audioBlob?: Blob | string;
  title: string;
  transcript: string;
  reminderDatetime: string | null;
  createdAt: string;
  waveformData?: number[];
}
