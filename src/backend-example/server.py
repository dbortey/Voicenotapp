"""
MindFat - spaCy Extraction Backend
This is a sample Python/Flask backend that extracts:
1. Title (3-8 word summary)
2. Reminder date/time (if mentioned)

Deploy this to Railway, Render, Heroku, or your own server.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
from dateparser import parse
from datetime import datetime
import re

app = Flask(__name__)
CORS(app)  # Enable CORS for browser requests

# Load spaCy model
try:
    nlp = spacy.load("en_core_web_sm")
except:
    print("ERROR: spaCy model not found. Run: python -m spacy download en_core_web_sm")
    nlp = None

@app.route('/extract', methods=['POST'])
def extract():
    """
    Extract title and reminder datetime from transcript
    
    Request body:
    {
        "transcript": "Remind me to call mom tomorrow at 3pm about the birthday party"
    }
    
    Response:
    {
        "title": "Call mom about birthday party",
        "reminder_datetime": "2025-12-06T15:00:00Z"
    }
    """
    try:
        data = request.json
        transcript = data.get('transcript', '').strip()
        
        if not transcript:
            return jsonify({
                'title': 'Untitled Note',
                'reminder_datetime': None
            })
        
        # Extract title
        title = extract_title(transcript)
        
        # Extract reminder datetime
        reminder_datetime = extract_datetime(transcript)
        
        return jsonify({
            'title': title,
            'reminder_datetime': reminder_datetime
        })
        
    except Exception as e:
        print(f"Error processing request: {e}")
        return jsonify({
            'title': generate_fallback_title(transcript),
            'reminder_datetime': None
        }), 200  # Return 200 even on error with fallback

def extract_title(transcript):
    """Extract a meaningful title from the transcript"""
    if not nlp:
        return generate_fallback_title(transcript)
    
    try:
        doc = nlp(transcript)
        
        # Remove common reminder phrases
        cleaned = transcript.lower()
        remove_phrases = ['remind me to', 'reminder to', 'remember to', 'don\'t forget to']
        for phrase in remove_phrases:
            cleaned = cleaned.replace(phrase, '')
        
        # Get important words (nouns, verbs, proper nouns)
        important_words = []
        doc_cleaned = nlp(cleaned)
        
        for token in doc_cleaned:
            if token.pos_ in ['NOUN', 'VERB', 'PROPN', 'ADJ'] and not token.is_stop:
                important_words.append(token.text)
        
        if important_words:
            title = ' '.join(important_words[:8])
        else:
            # Fallback: first 8 words
            words = transcript.split()[:8]
            title = ' '.join(words)
        
        # Capitalize first letter
        title = title.strip().capitalize()
        
        # Add ellipsis if truncated
        if len(transcript.split()) > 8:
            title += '...'
        
        return title or 'Untitled Note'
        
    except Exception as e:
        print(f"Error extracting title: {e}")
        return generate_fallback_title(transcript)

def extract_datetime(transcript):
    """Extract datetime from transcript using NLP and patterns"""
    if not nlp:
        return None
    
    try:
        doc = nlp(transcript)
        
        # Method 1: Look for DATE and TIME entities
        date_entities = [ent.text for ent in doc.ents if ent.label_ in ['DATE', 'TIME', 'EVENT']]
        
        for entity in date_entities:
            try:
                parsed = parse(entity, settings={
                    'PREFER_DATES_FROM': 'future',
                    'RELATIVE_BASE': datetime.now()
                })
                if parsed and parsed > datetime.now():
                    return parsed.isoformat()
            except:
                continue
        
        # Method 2: Common time patterns
        time_patterns = [
            r'tomorrow at (\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)',
            r'today at (\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)',
            r'at (\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)',
            r'next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)',
            r'on (monday|tuesday|wednesday|thursday|friday|saturday|sunday)',
            r'in (\d+) (hour|hours|minute|minutes|day|days)',
        ]
        
        text_lower = transcript.lower()
        
        for pattern in time_patterns:
            match = re.search(pattern, text_lower)
            if match:
                try:
                    parsed = parse(match.group(0), settings={
                        'PREFER_DATES_FROM': 'future',
                        'RELATIVE_BASE': datetime.now()
                    })
                    if parsed and parsed > datetime.now():
                        return parsed.isoformat()
                except:
                    continue
        
        return None
        
    except Exception as e:
        print(f"Error extracting datetime: {e}")
        return None

def generate_fallback_title(transcript):
    """Generate a simple fallback title"""
    words = transcript.split()[:8]
    title = ' '.join(words)
    if len(transcript.split()) > 8:
        title += '...'
    return title or 'Untitled Note'

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'spacy_loaded': nlp is not None,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("=" * 50)
    print("MindFat Extraction Backend")
    print("=" * 50)
    print(f"spaCy model loaded: {nlp is not None}")
    print("Starting server on http://0.0.0.0:5000")
    print("=" * 50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
