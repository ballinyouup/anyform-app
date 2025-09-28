"use server"
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv"
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey){
    throw new Error("Environment vars not working!");
}

const ai = new GoogleGenAI({apiKey: apiKey});

const textGenModel = 'gemini-2.5-flash';
const imageGenModel = 'imagen-4.0-generate-001';
const visionModel = 'gemini-2.5-flash';

/**
 * Generates a summary and image prompts from a given text.
 */
export const generateContentFromText = async (text: string): Promise<{ summary: string; imagePrompts: string[] }> => {
    const prompt = `
Summarize the following text in a concise, easy-to-understand paragraph.
After the summary, generate 3 distinct and creative prompts that could be used to create visually compelling images that represent the key themes of the content.
Do not use markdown formatting.

Text: "${text}"
`;

    const response = await ai.models.generateContent({
        model: textGenModel,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: {
                        type: Type.STRING,
                        description: 'A concise summary of the provided text.'
                    },
                    imagePrompts: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        },
                        description: 'An array of three distinct image generation prompts.'
                    }
                }
            }
        }
    });
    if (!response.text) {
        return { summary: "no response", imagePrompts: [] };
    }

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse;
};

/**
 * Generates content from an audio file by transcribing, summarizing, and creating image prompts.
 */
export const generateContentFromAudio = async (audio: { mimeType: string; data: string }): Promise<{ summary: string; imagePrompts: string[] }> => {
    const audioPart = {
        inlineData: {
            mimeType: audio.mimeType,
            data: audio.data,
        },
    };

    const textPart = {
        text: `
    Please perform the following tasks with the provided audio file:
    1. Transcribe the audio content into text.
    2. Summarize the transcribed text into a concise, easy-to-understand paragraph.
    3. Based on the summary, generate 3 distinct and creative prompts that could be used to create visually compelling images representing the key themes.
    Return the result in a JSON format with 'summary' and 'imagePrompts' keys. Do not use markdown formatting.
`
    };

    const response = await ai.models.generateContent({
        model: visionModel,
        contents: { parts: [audioPart, textPart] },
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: {
                        type: Type.STRING,
                        description: 'A concise summary of the transcribed audio.'
                    },
                    imagePrompts: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        },
                        description: 'An array of three distinct image generation prompts based on the summary.'
                    }
                }
            }
        }
    });
    if (!response.text) {
        return { summary: "no response", imagePrompts: [] };
    }
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse;
};

/**
 * Generates a descriptive summary from an image.
 */
export const generateSummaryFromImage = async (image: { mimeType: string; data: string }): Promise<string> => {
    const imagePart = {
        inlineData: {
            mimeType: image.mimeType,
            data: image.data,
        },
    };

    const textPart = {
        text: 'Describe this image in detail. What is the subject, what is happening, and what is the overall mood or theme? Provide a concise one-paragraph summary suitable for a text-to-speech application.'
    };

    const response = await ai.models.generateContent({
        model: visionModel,
        contents: { parts: [imagePart, textPart] },
    });
    if (!response.text) {
        return "no resposne";
    }

    return response.text;
};

/**
 * Generates images from a list of prompts.
 */
export const generateImages = async (prompts: string[]): Promise<string[]> => {
    if (prompts.length === 0) return [];

    const imagePromises = prompts.map(prompt =>
        ai.models.generateImages({
            model: imageGenModel,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        })
    );

    const results = await Promise.all(imagePromises);
    return results.map(result => {
        if (!result.generatedImages?.[0]?.image?.imageBytes) {
            return "no total response";
        }
        const base64ImageBytes = result.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    });
};