// spaCy Extraction Service
// Replace with your actual backend endpoint URL

const EXTRACTION_ENDPOINT = 'https://api.example.com/extract'; // TODO: Replace with your backend URL

interface ExtractionResult {
  title: string;
  reminderDatetime: string | null;
}

export async function extractInfo(transcript: string): Promise<ExtractionResult> {
  try {
    const response = await fetch(EXTRACTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
      }),
    });

    if (!response.ok) {
      throw new Error(`Extraction failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      title: data.title || generateDefaultTitle(transcript),
      reminderDatetime: data.reminder_datetime || null,
    };
  } catch (error) {
    console.error('Extraction error:', error);
    // Fallback: generate title from transcript
    return {
      title: generateDefaultTitle(transcript),
      reminderDatetime: null,
    };
  }
}

function generateDefaultTitle(transcript: string): string {
  // Simple fallback: take first 50 characters
  const words = transcript.split(' ').slice(0, 8);
  let title = words.join(' ');
  
  if (transcript.split(' ').length > 8) {
    title += '...';
  }
  
  return title || 'Untitled Note';
}
