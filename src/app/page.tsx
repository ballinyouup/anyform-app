"use client"
import React, { useState, useCallback, useEffect } from 'react';
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
    const [particles, setParticles] = useState<Array<{
        id: number;
        size: number;
        x: number;
        y: number;
        duration: number;
        delay: number;
    }>>([]);

    useEffect(() => {
        // Generate particles only on client side to avoid hydration mismatch
        setParticles(Array.from({ length: 12 }, (_, i) => ({
            id: i,
            size: Math.random() * 2 + 1,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 15 + 10,
            delay: Math.random() * 5
        })));
    }, []);
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
        <div className="fixed inset-0 overflow-hidden">
            {/* Dark gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-black"></div>

            {/* Animated overlay */}
            <div
                className="absolute inset-0 opacity-50"
                style={{
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(251,146,60,0.4))',
                    backgroundSize: '300% 300%',
                    animation: 'subtleShift 15s ease-in-out infinite'
                }}
            ></div>

            {/* Minimal floating particles */}
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="absolute rounded-full bg-white opacity-60"
                    style={{
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        animation: `float ${particle.duration}s ease-in-out infinite`,
                        animationDelay: `${particle.delay}s`,
                        filter: 'blur(0.5px)'
                    }}
                ></div>
            ))}

            {/* Subtle mesh overlay */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                    animation: 'meshDrift 25s linear infinite'
                }}
            ></div>

            {/* CSS Animation Styles */}
            <style jsx>{`
        @keyframes subtleShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.6;
          }
          50% { 
            transform: translateY(-30px) translateX(15px);
            opacity: 0.9;
          }
        }
        
        @keyframes meshDrift {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(-40px) translateY(-40px); }
        }
      `}</style>
        <div className="min-h-screen bg-base-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-background tracking-tight">
                        Media <span className="text-background">Multiverse</span>
                    </h1>
                    <p className="mt-3 text-lg text-background max-w-2xl mx-auto">
                        Upload a file or paste text to transform it into new, accessible formats.
                    </p>
                </header>

                <main className="bg-background rounded-xl shadow-2xl p-6 sm:p-8 relative z-20">
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
        </div>
    );
};

export default App;
