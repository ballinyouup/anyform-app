import React, { useState, useEffect, useCallback } from 'react';

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75zm9 0a.75.75 0 01.75.75v12a.75.75 0 01-1.5 0V6a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
);

interface AudioPlayerProps {
    text: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const synth = window.speechSynthesis;

    const handlePlay = useCallback(() => {
        if (!synth) return;
        if (synth.speaking && isPaused) {
            synth.resume();
            setIsPlaying(true);
            setIsPaused(false);
        } else {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => {
                setIsPlaying(false);
                setIsPaused(false);
            };
            synth.cancel(); // Clear any previous utterances
            synth.speak(utterance);
            setIsPlaying(true);
            setIsPaused(false);
        }
    }, [text, synth, isPaused]);

    const handlePause = useCallback(() => {
        if (synth && synth.speaking) {
            synth.pause();
            setIsPlaying(false);
            setIsPaused(true);
        }
    }, [synth]);

    const handleStop = useCallback(() => {
        if (synth) {
            synth.cancel();
            setIsPlaying(false);
            setIsPaused(false);
        }
    }, [synth]);

    useEffect(() => {
        // Cleanup function to cancel speech when component unmounts or text changes
        return () => {
            if (synth) {
                synth.cancel();
            }
        };
    }, [text, synth]);

    if (!synth) {
        return <p className="text-sm text-amber-400">Text-to-speech is not supported in your browser.</p>;
    }

    return (
        <div className="flex items-center space-x-2 pt-4 border-t border-base-300">
            {!isPlaying ? (
                <button onClick={handlePlay} className="p-2 rounded-full transition-colors cursor-pointer">
                    <PlayIcon />
                </button>
            ) : (
                <button onClick={handlePause} className="p-2 rounded-full transition-colors cursor-pointer">
                    <PauseIcon />
                </button>
            )}
            {/*{(isPlaying || isPaused) && (*/}
            {/*    <button onClick={handleStop} className="p-2 rounded-full bg-base-300 text-text-primary hover:bg-gray-500 transition-colors">*/}
            {/*        <StopIcon/>*/}
            {/*    </button>*/}
            {/*)}*/}
            <span className="text-sm text-text-secondary">{isPlaying ? "Playing..." : isPaused ? "Paused" : "Listen to summary"}</span>
        </div>
    );
};
