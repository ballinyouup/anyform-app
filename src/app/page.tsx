"use client"
import React, { useState, useCallback } from 'react';
import type { AppOutput, InputType } from '@/lib/types';
import { DropZone } from '@/components/DropZone';
import { OutputDisplay } from '@/components/OutputDisplay';
import * as geminiService from '@/lib/geminiService';
import { extractTextFromPdf, fileToBase64 } from '@/lib/utils';
import { Spinner } from '@/components/Spinner';

const App: React.FC = () => {
    const [inputType, setInputType] = useState<InputType>('file');
    const [inputFile, setInputFile] = useState<File | null>(null);
    const [inputText, setInputText] = useState<string>('');
    const [output, setOutput] = useState<AppOutput | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setOutput(null);

        try {
            if (inputType === 'file' && inputFile) {
                if (inputFile.type.startsWith('image/')) {
                    const base64Image = await fileToBase64(inputFile);
                    const summary = await geminiService.generateSummaryFromImage({
                        mimeType: inputFile.type,
                        data: base64Image.split(',')[1],
                    });
                    setOutput({ summary });
                } else if (inputFile.type === 'application/pdf') {
                    const text = await extractTextFromPdf(inputFile);
                    const { summary, imagePrompts } = await geminiService.generateContentFromText(text);
                    const images = await geminiService.generateImages(imagePrompts);
                    setOutput({ summary, images });
                } else if (inputFile.type.startsWith('audio/')) {
                    const base64Audio = await fileToBase64(inputFile);
                    const { summary, imagePrompts } = await geminiService.generateContentFromAudio({
                        mimeType: inputFile.type,
                        data: base64Audio.split(',')[1],
                    });
                    const images = await geminiService.generateImages(imagePrompts);
                    setOutput({ summary, images });
                } else {
                    throw new Error('Unsupported file type. Please use an image, PDF, or audio file.');
                }
            } else if (inputType === 'text' && inputText.trim()) {
                const { summary, imagePrompts } = await geminiService.generateContentFromText(inputText);
                const images = await geminiService.generateImages(imagePrompts);
                setOutput({ summary, images });
            } else {
                throw new Error('Please provide a file or paste some text to generate content.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [inputFile, inputText, inputType]);

    const handleReset = () => {
        setInputFile(null);
        setInputText('');
        setOutput(null);
        setError(null);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight">
                        Media <span className="text-brand-primary">Multiverse</span>
                    </h1>
                    <p className="mt-3 text-lg text-text-secondary max-w-2xl mx-auto">
                        Upload a file or paste text to transform it into new, accessible formats.
                    </p>
                </header>

                <main className="bg-base-200 rounded-xl shadow-2xl p-6 sm:p-8">
                    {!output && !isLoading && (
                        <DropZone
                            inputType={inputType}
                            setInputType={setInputType}
                            inputFile={inputFile}
                            setInputFile={setInputFile}
                            inputText={inputText}
                            setInputText={setInputText}
                            onGenerate={handleGenerate}
                            isLoading={isLoading}
                        />
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center min-h-[300px]">
                            <Spinner />
                            <p className="text-text-secondary mt-4">Generating new perspectives...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                            <p className="font-semibold">An Error Occurred</p>
                            <p>{error}</p>
                            <button onClick={handleReset} className="mt-4 bg-primary hover:bg-secondary font-bold py-2 px-4 rounded-lg transition-colors">
                                Try Again
                            </button>
                        </div>
                    )}

                    {output && !isLoading && (
                        <div>
                            <OutputDisplay output={output} />
                            <div className="text-center mt-8">
                                <button onClick={handleReset} className="bg-primary text-white cursor-pointer font-bold py-2 px-6 rounded-lg transition-colors duration-300">
                                    Start Over
                                </button>
                            </div>
                        </div>
                    )}
                </main>
                <footer className="text-center mt-8 text-sm text-base-300">
                    <p>Powered by React, Tailwind CSS, and Gemini API</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
