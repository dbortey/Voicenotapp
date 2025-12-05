# MindFat - Quick Setup Guide

## Replace These 3 Items to Get Started:

### 1️⃣ AssemblyAI API Key

**File:** `/services/assemblyai.ts`  
**Line:** 4

```typescript
const ASSEMBLYAI_API_KEY = 'YOUR_ASSEMBLYAI_API_KEY'; // ← Replace this
```

**Get your key:** https://www.assemblyai.com/app/account


### 2️⃣ Supabase Credentials

**File:** `/services/supabase.ts`  
**Lines:** 6-7

```typescript
const SUPABASE_URL = 'https://your-project.supabase.co'; // ← Replace this
const SUPABASE_ANON_KEY = 'your-anon-key'; // ← Replace this
```

**Get credentials:** https://app.supabase.com → Your Project → Settings → API

**Then create the database table:**

```sql
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
CREATE INDEX idx_created_at ON notes(created_at DESC);
```

**And create the storage bucket:**

Go to Storage → Create bucket → Name: `voice-notes` → Make it public


### 3️⃣ spaCy Extraction Endpoint

**File:** `/services/extraction.ts`  
**Line:** 4

```typescript
const EXTRACTION_ENDPOINT = 'https://api.example.com/extract'; // ← Replace this
```

**Expected API contract:**

```
POST /extract
Content-Type: application/json

{
  "transcript": "Remind me to call mom tomorrow at 3pm about the birthday party"
}

Response:
{
  "title": "Call mom about birthday party",
  "reminder_datetime": "2025-12-06T15:00:00Z"
}
```

**Quick Python/Flask implementation:**

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
from dateparser import parse
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for browser requests

nlp = spacy.load("en_core_web_sm")

@app.route('/extract', methods=['POST'])
def extract():
    data = request.json
    transcript = data.get('transcript', '')
    
    # Extract title
    doc = nlp(transcript)
    
    # Get first 8 words as title
    words = transcript.split()[:8]
    title = ' '.join(words)
    if len(transcript.split()) > 8:
        title += '...'
    
    # Extract date/time
    reminder_datetime = None
    
    # Look for date entities
    for ent in doc.ents:
        if ent.label_ in ['DATE', 'TIME', 'EVENT']:
            try:
                parsed = parse(ent.text, settings={'PREFER_DATES_FROM': 'future'})
                if parsed:
                    reminder_datetime = parsed.isoformat()
                    break
            except:
                pass
    
    # Also try parsing common patterns
    if not reminder_datetime:
        time_patterns = [
            r'tomorrow at (\d{1,2}(?::\d{2})?\s*(?:am|pm)?)',
            r'at (\d{1,2}(?::\d{2})?\s*(?:am|pm)?)',
            r'on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)',
        ]
        for pattern in time_patterns:
            match = re.search(pattern, transcript.lower())
            if match:
                try:
                    parsed = parse(match.group(0), settings={'PREFER_DATES_FROM': 'future'})
                    if parsed:
                        reminder_datetime = parsed.isoformat()
                        break
                except:
                    pass
    
    return jsonify({
        'title': title or 'Untitled Note',
        'reminder_datetime': reminder_datetime
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

Install dependencies:
```bash
pip install flask flask-cors spacy dateparser
python -m spacy download en_core_web_sm
```

Deploy to:
- **Heroku** (free tier)
- **Railway** (https://railway.app)
- **Render** (https://render.com)
- **DigitalOcean App Platform**
- **Your own server**

---

## That's it! 🎉

Run `npm install` then `npm run dev` and you're ready to go!
