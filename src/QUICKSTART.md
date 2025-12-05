# 🚀 MindFat - 5-Minute Quickstart

## Step 1: Install Dependencies (30 seconds)

```bash
npm install
```

## Step 2: Configure 3 API Keys (2 minutes)

### A. AssemblyAI (for transcription)

1. Go to https://www.assemblyai.com/app/account
2. Copy your API key
3. Open `/services/assemblyai.ts`
4. Replace line 4:
   ```typescript
   const ASSEMBLYAI_API_KEY = 'your-actual-key-here';
   ```

### B. Supabase (for storage)

1. Go to https://app.supabase.com
2. Create new project (or use existing)
3. Go to Settings → API
4. Copy URL and anon/public key
5. Open `/services/supabase.ts`
6. Replace lines 6-7:
   ```typescript
   const SUPABASE_URL = 'https://xxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGc...your-key';
   ```

### C. spaCy Endpoint (for extraction)

**Option 1: Use fallback mode (works without backend)**
- The app will gracefully fallback if the endpoint is not available
- It will generate titles from the first 8 words of transcript
- No reminder extraction (manual extraction disabled)

**Option 2: Deploy quick Python backend (5 min)**

1. Create `server.py`:
   ```python
   from flask import Flask, request, jsonify
   from flask_cors import CORS
   
   app = Flask(__name__)
   CORS(app)
   
   @app.route('/extract', methods=['POST'])
   def extract():
       transcript = request.json.get('transcript', '')
       words = transcript.split()[:8]
       title = ' '.join(words) + ('...' if len(transcript.split()) > 8 else '')
       return jsonify({'title': title, 'reminder_datetime': None})
   
   app.run(host='0.0.0.0', port=5000)
   ```

2. Deploy to Railway/Render/Heroku
3. Update `/services/extraction.ts` line 4 with your URL

## Step 3: Setup Supabase Database (1 minute)

1. Go to Supabase SQL Editor
2. Run this SQL:

```sql
-- Create table
CREATE TABLE notes (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  title TEXT NOT NULL,
  transcript TEXT NOT NULL,
  reminder_datetime TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_user_id ON notes(user_id);
```

3. Go to Storage → Create Bucket
4. Name: `voice-notes`
5. Make it **public** ✅

## Step 4: Run the App! (5 seconds)

```bash
npm run dev
```

Open http://localhost:5173

---

## ✅ Testing Checklist

1. **Record Audio**: Tap microphone button
2. **Check Transcription**: Wait for "Processing..."
3. **View Note**: Should appear in list with waveform
4. **Play Audio**: Click waveform or play button
5. **Delete Note**: Tap delete button twice
6. **Offline Mode**: Turn off WiFi, record note, turn on WiFi, sync

---

## 🔧 Common Issues

### "Failed to access microphone"
→ Grant microphone permission in browser settings  
→ Use HTTPS in production (localhost is OK for dev)

### "Transcription failed"
→ Check AssemblyAI API key  
→ Check browser console for errors  
→ Verify audio is recording (check timer)

### "Failed to save note"
→ Check Supabase credentials  
→ Verify database table exists  
→ Verify storage bucket exists and is public  
→ App will fallback to offline storage automatically

### "No notes showing"
→ Check user_id is being generated (check console)  
→ Verify Supabase table has data  
→ Check browser IndexedDB for offline notes

---

## 📱 Deploy to Production

### Option 1: Vercel (recommended)
```bash
npm run build
vercel deploy
```

### Option 2: Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages
```bash
npm run build
# Push dist/ folder to gh-pages branch
```

---

## 🎯 Next Steps

- Replace `/public/icon-192.png` and `/public/icon-512.png` with your logo
- Customize colors in `/styles/globals.css`
- Add more NLP extraction rules to spaCy backend
- Implement user authentication (optional)
- Add note editing and tagging features
- Deploy spaCy backend to production server

---

## 💡 Pro Tips

1. **Test on Mobile**: Use `npm run dev -- --host` to access from phone
2. **Install as PWA**: Use browser's "Add to Home Screen"
3. **Enable Notifications**: Allow notifications for reminders
4. **Use Offline**: Works 100% offline with IndexedDB
5. **Auto-Sync**: Notes sync automatically when back online

---

## 📞 Need Help?

- Check browser console for detailed error messages
- Verify all API keys are correct
- Test each service independently (AssemblyAI, Supabase, spaCy)
- Make sure CORS is enabled on your spaCy backend
- Use browser DevTools → Application → Storage to inspect IndexedDB

**You're all set! Start recording your voice notes! 🎤**
