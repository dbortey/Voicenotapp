# MindFat - Voice Note Reminder App

A premium, mobile-first PWA for recording 1-minute voice notes with AI transcription and smart reminders.

## 🚀 Features

- **Voice Recording**: Record up to 60 seconds with auto-stop
- **AI Transcription**: AssemblyAI integration for accurate transcription
- **Smart Extraction**: spaCy backend extracts titles and reminder dates
- **Visual Waveforms**: Interactive waveform display with wavesurfer.js
- **Offline Support**: Full offline functionality with Dexie.js (IndexedDB)
- **Push Notifications**: Browser notifications for reminders
- **PWA Ready**: Installable as a native app with Service Worker
- **Beautiful UI**: Dark mode, glassmorphism effects, mobile-optimized
- **Auto-Sync**: Automatic synchronization when back online

## 📋 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure AssemblyAI

Edit `/services/assemblyai.ts` and replace the API key:

```typescript
const ASSEMBLYAI_API_KEY = 'YOUR_ASSEMBLYAI_API_KEY'; // Replace with your key
```

Get your API key from: https://www.assemblyai.com/

### 3. Configure spaCy Extraction Backend

Edit `/services/extraction.ts` and replace the endpoint URL:

```typescript
const EXTRACTION_ENDPOINT = 'https://api.example.com/extract'; // Replace with your URL
```

**Expected Backend Response Format:**

```json
{
  "title": "Short 3-8 word summary",
  "reminder_datetime": "2025-12-06T15:30:00Z" // ISO string or null
}
```

**Sample Python/Flask Backend:**

```python
from flask import Flask, request, jsonify
import spacy
from dateparser import parse

app = Flask(__name__)
nlp = spacy.load("en_core_web_sm")

@app.route('/extract', methods=['POST'])
def extract():
    data = request.json
    transcript = data.get('transcript', '')
    
    # Extract title (first sentence or key phrases)
    doc = nlp(transcript)
    sentences = list(doc.sents)
    title = str(sentences[0]) if sentences else transcript[:50]
    
    # Extract dates and times
    reminder_datetime = None
    # Use spaCy entities or dateparser library
    for ent in doc.ents:
        if ent.label_ in ['DATE', 'TIME']:
            parsed = parse(ent.text)
            if parsed:
                reminder_datetime = parsed.isoformat()
                break
    
    return jsonify({
        'title': title,
        'reminder_datetime': reminder_datetime
    })
```

### 4. Configure Supabase

Edit `/services/supabase.ts` and replace credentials:

```typescript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

**Database Schema (SQL):**

```sql
-- Create notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  title TEXT NOT NULL,
  transcript TEXT NOT NULL,
  reminder_datetime TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at DESC)
);

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-notes', 'voice-notes', true);

-- Set storage policy
CREATE POLICY "Public Access"
ON storage.objects FOR ALL
USING (bucket_id = 'voice-notes');
```

### 5. Add PWA Icons

Replace placeholder icons in `/public/`:
- `icon-192.png` (192x192 PNG)
- `icon-512.png` (512x512 PNG)

### 6. Run Development Server

```bash
npm run dev
```

### 7. Build for Production

```bash
npm run build
```

The app will be in `/dist` - deploy to any static hosting service.

## 🔧 Configuration Checklist

- [ ] AssemblyAI API key configured
- [ ] spaCy extraction endpoint URL configured
- [ ] Supabase URL and anon key configured
- [ ] Supabase database table created
- [ ] Supabase storage bucket created
- [ ] PWA icons added
- [ ] Service Worker registered

## 📱 User Identification

Users are identified by a combination of:
1. **Cookie value** (persistent, 10-year expiry)
2. **IP address** (from api.ipify.org)

This creates a unique `user_id` without requiring login or email.

## 🔐 Security Notes

⚠️ **Important**: This demo app is designed for personal use and prototyping:

- No authentication or encryption
- IP + cookie identification is not secure for production
- Not suitable for collecting PII or sensitive data
- For production, implement proper authentication (OAuth, JWT, etc.)

## 🌐 Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers with WebRTC support

## 📦 Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Supabase** - Backend & storage
- **Dexie.js** - Offline storage
- **WaveSurfer.js** - Waveform visualization
- **AssemblyAI** - Speech-to-text
- **spaCy** - NLP extraction (your backend)

## 🐛 Troubleshooting

### Microphone not working
- Grant microphone permissions in browser settings
- Use HTTPS (required for getUserMedia API)

### Transcription failing
- Check AssemblyAI API key is correct
- Verify audio file uploads successfully
- Check browser console for errors

### Offline mode not working
- Ensure Service Worker is registered
- Check IndexedDB is enabled in browser
- Verify Dexie.js is installed

### Notifications not showing
- Grant notification permissions
- Check browser supports Notification API
- Ensure page is not muted

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

This is a demo/starter project. Feel free to fork and customize!

---

**Built with ❤️ for voice note enthusiasts**
