// AssemblyAI Transcription Service
// Replace YOUR_ASSEMBLYAI_API_KEY with your actual API key

const ASSEMBLYAI_API_KEY = 'YOUR_ASSEMBLYAI_API_KEY'; // TODO: Replace with your API key
const UPLOAD_URL = 'https://api.assemblyai.com/v2/upload';
const TRANSCRIPT_URL = 'https://api.assemblyai.com/v2/transcript';

export async function transcribeAudio(audioBlob: Blob): Promise<string | null> {
  try {
    // Step 1: Upload audio file
    const uploadResponse = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
      },
      body: audioBlob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    const { upload_url } = await uploadResponse.json();

    // Step 2: Request transcription
    const transcriptResponse = await fetch(TRANSCRIPT_URL, {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
      }),
    });

    if (!transcriptResponse.ok) {
      throw new Error(`Transcription request failed: ${transcriptResponse.statusText}`);
    }

    const { id } = await transcriptResponse.json();

    // Step 3: Poll for completion
    let transcript = null;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const pollingResponse = await fetch(`${TRANSCRIPT_URL}/${id}`, {
        headers: {
          'authorization': ASSEMBLYAI_API_KEY,
        },
      });

      if (!pollingResponse.ok) {
        throw new Error(`Polling failed: ${pollingResponse.statusText}`);
      }

      const result = await pollingResponse.json();

      if (result.status === 'completed') {
        transcript = result.text;
        break;
      } else if (result.status === 'error') {
        throw new Error(`Transcription error: ${result.error}`);
      }

      attempts++;
    }

    return transcript;
  } catch (error) {
    console.error('AssemblyAI transcription error:', error);
    return null;
  }
}
