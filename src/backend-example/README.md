# MindFat Backend - spaCy Extraction Service

This is the NLP extraction backend that processes voice note transcripts to extract:
1. **Title** - A concise 3-8 word summary
2. **Reminder DateTime** - Any mentioned dates/times (ISO format)

## Quick Deploy

### Option 1: Railway (Easiest)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select this folder
4. Railway will auto-detect Python and install dependencies
5. Copy the deployed URL (e.g., `https://your-app.railway.app`)
6. Update `/services/extraction.ts` in the main app

### Option 2: Render

1. Go to https://render.com
2. New → Web Service → Connect GitHub repo
3. Build Command: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
4. Start Command: `gunicorn server:app`
5. Copy the URL
6. Update `/services/extraction.ts`

### Option 3: Heroku

```bash
# Install Heroku CLI first
heroku create mindfat-extraction
git add .
git commit -m "Deploy backend"
git push heroku main
```

Create `Procfile`:
```
web: gunicorn server:app
```

### Option 4: Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm

# Run server
python server.py
```

Server runs on http://localhost:5000

## Testing

```bash
curl -X POST http://localhost:5000/extract \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Remind me to call mom tomorrow at 3pm"}'
```

Expected response:
```json
{
  "title": "Call mom",
  "reminder_datetime": "2025-12-06T15:00:00"
}
```

## API Endpoints

### POST /extract

Extract title and reminder from transcript.

**Request:**
```json
{
  "transcript": "Your transcribed text here"
}
```

**Response:**
```json
{
  "title": "Short summary (3-8 words)",
  "reminder_datetime": "2025-12-06T15:00:00Z" // or null
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "spacy_loaded": true,
  "timestamp": "2025-12-05T12:00:00Z"
}
```

## Environment Variables

None required! All settings are in the code.

## Customization

### Improve Title Extraction

Edit `extract_title()` function to:
- Filter more stop words
- Use different POS tags
- Apply custom NLP rules
- Use summarization models

### Improve Date/Time Extraction

Edit `extract_datetime()` function to:
- Add more time patterns
- Support different languages
- Handle relative dates better
- Parse complex time expressions

### Add More Features

- Extract categories/tags
- Sentiment analysis
- Language detection
- Named entity recognition
- Priority detection

## Troubleshooting

### "spaCy model not found"
```bash
python -m spacy download en_core_web_sm
```

### "CORS error"
- Make sure `flask-cors` is installed
- Check that `CORS(app)` is called

### "Module not found"
```bash
pip install -r requirements.txt
```

## Production Tips

1. **Use production WSGI server**: Already using gunicorn
2. **Add rate limiting**: Use Flask-Limiter
3. **Add authentication**: Use API keys if needed
4. **Monitor errors**: Use Sentry or similar
5. **Cache results**: Use Redis for common extractions
6. **Scale**: Deploy multiple instances

## Cost

All deployment options have generous free tiers:
- **Railway**: $5 credit/month (enough for hobby projects)
- **Render**: 750 hours/month free
- **Heroku**: Free with credit card verification
- **DigitalOcean**: $5/month for basic droplet

This lightweight service should cost $0-5/month for moderate usage.
