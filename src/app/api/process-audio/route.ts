import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: apiKey });
const visionModel = 'gemini-2.5-flash';

export async function POST(request: NextRequest) {
    try {
        const { mimeType, data } = await request.json();

        if (!mimeType || !data) {
            return NextResponse.json(
                { error: 'Missing mimeType or data' },
                { status: 400 }
            );
        }

        const audioPart = {
            inlineData: {
                mimeType: mimeType,
                data: data,
            },
        };

        const textPart = {
            text: `
        Please perform the following tasks with the provided audio file:
        1. Transcribe the audio content into text.
        2. Based on the transcription, generate 3 distinct and creative prompts that could be used to create visually compelling images representing the key themes.
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
                            description: 'A transcription of the audio file.'
                        },
                        imagePrompts: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING
                            },
                            description: 'An array of three distinct image generation prompts based on the transcription.'
                        }
                    }
                }
            }
        });

        if (!response.text) {
            return NextResponse.json(
                { error: 'No response from Gemini API' },
                { status: 500 }
            );
        }

        const result = JSON.parse(response.text);
        return NextResponse.json(result);

    } catch (error) {
        console.error('Error processing audio:', error);
        return NextResponse.json(
            { error: 'Failed to process audio file' },
            { status: 500 }
        );
    }
}
