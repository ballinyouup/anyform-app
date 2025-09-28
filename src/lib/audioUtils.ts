/**
 * Client-side utility for processing audio files.
 * This function calls the API route to handle large audio files.
 */
export const generateContentFromAudio = async (audio: { mimeType: string; data: string }): Promise<{ summary: string; imagePrompts: string[] }> => {
    try {
        const response = await fetch('/api/process-audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mimeType: audio.mimeType,
                data: audio.data,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }

        return {
            summary: result.summary || "No transcription available",
            imagePrompts: result.imagePrompts || []
        };
    } catch (error) {
        console.error('Error processing audio:', error);
        return { 
            summary: "Error processing audio file", 
            imagePrompts: [] 
        };
    }
};
