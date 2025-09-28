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
const groundingTool = {
    googleSearch: {},
};

const config = {
    tools: [groundingTool],
};

/**
 * Removes inline citations from response text to provide clean reading experience
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
export async function getCleanText(response: any): Promise<string> {
    let text = response.text;
    
    if (!text) {
        return text;
    }

    // Remove markdown-style citations like [1](url), [2](url), etc.
    text = text.replace(/\[\d+]\([^)]+\)/g, '');
    
    // Clean up any extra spaces or commas left behind
    text = text.replace(/,\s*,/g, ','); // Remove double commas
    text = text.replace(/\s+/g, ' '); // Normalize whitespace
    text = text.replace(/,\s*\./g, '.'); // Fix comma before period
    text = text.trim();
    
    return text;
}

/**
 * Extracts web search metadata from a Gemini response
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
export const extractWebSearchMetadata = async (response: any) => {
    const groundingMetadata = response.candidates[0]?.groundingMetadata;
    
    if (!groundingMetadata) {
        return {
            webSearchQueries: [],
            groundingChunks: [],
            groundingSupports: []
        };
    }

    return {
        webSearchQueries: groundingMetadata.webSearchQueries || [],
        groundingChunks: groundingMetadata.groundingChunks || [],
        groundingSupports: groundingMetadata.groundingSupports || []
    };
};

/**
 * Performs a web search using Gemini's grounding capability
 */
export const performWebSearch = async (query: string): Promise<{
    response: string;
    cleanResponse: string;
    webSearchQueries: string[];
    sources: Array<{ title: string; uri: string }>;
}> => {
    const response = await ai.models.generateContent({
        model: textGenModel,
        contents: query,
        config,
    });

    if (!response.text) {
        return {
            response: "No response generated",
            cleanResponse: "No response generated",
            webSearchQueries: [],
            sources: []
        };
    }

    const cleanResponse = await getCleanText(response);
    const metadata = await extractWebSearchMetadata(response);
    
    const sources = metadata.groundingChunks.map((chunk: any) => ({
        title: chunk.web?.title || "Unknown source",
        uri: chunk.web?.uri || ""
    }));

    return {
        response: response.text,
        cleanResponse,
        webSearchQueries: metadata.webSearchQueries,
        sources
    };
};
/**
 * Generates a summary and image prompts from a given text.
 */
export const generateContentFromText = async (text: string): Promise<{ summary: string; imagePrompts: string[], webSearchResults: string[] }> => {
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
        },
    });
    
    if (!response.text) {
        return { summary: "no response", imagePrompts: [], webSearchResults: [] };
    }

    const jsonResponse = JSON.parse(response.text);
    
    // Since we're not using grounding tools with structured JSON output,
    // we'll return empty web search results for this function
    const webSearchResults: string[] = [];
    
    return {
        summary: jsonResponse.summary,
        imagePrompts: jsonResponse.imagePrompts,
        webSearchResults
    };
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
        return "no response";
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