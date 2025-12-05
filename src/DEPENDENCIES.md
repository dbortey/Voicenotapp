# Required Dependencies

Add these to your project:

```bash
npm install @supabase/supabase-js
npm install dexie
npm install wavesurfer.js
npm install uuid
npm install sonner@2.0.3
npm install lucide-react
```

## Package.json Dependencies

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0",
    "dexie": "^3.2.4",
    "lucide-react": "^0.294.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "sonner": "2.0.3",
    "uuid": "^9.0.1",
    "wavesurfer.js": "^7.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@types/uuid": "^9.0.7",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.8"
  }
}
```

## Browser APIs Used

- **MediaRecorder API** - Audio recording
- **Web Audio API** - Audio processing
- **Notification API** - Push notifications
- **Service Worker API** - PWA functionality
- **IndexedDB** - Offline storage (via Dexie)
- **Fetch API** - HTTP requests
- **getUserMedia** - Microphone access

## External Services

1. **AssemblyAI** (https://www.assemblyai.com)
   - Speech-to-text transcription
   - Free tier: 5 hours/month
   - API endpoint: `https://api.assemblyai.com/v2/`

2. **Supabase** (https://supabase.com)
   - PostgreSQL database
   - File storage
   - Free tier: 500MB database, 1GB storage

3. **api.ipify.org** (https://www.ipify.org)
   - IP address lookup
   - Free public service

4. **Your spaCy Backend**
   - Custom NLP extraction service
   - You host this separately
