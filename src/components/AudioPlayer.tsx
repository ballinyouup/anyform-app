// components/AudioPlayer.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';

// --- SVG Icons (No changes needed) ---
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


// --- Component Interface ---
interface AudioPlayerProps {
    text: string;
}


// --- Refactored AudioPlayer Component for ElevenLabs ---
export const AudioPlayer: React.FC<AudioPlayerProps> = ({ text }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    // A good default voice, find more on the ElevenLabs website.
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel

    // This useEffect hook handles cleanup when the component unmounts or the text changes.
    useEffect(() => {
        // This function is returned by the effect and acts as the cleanup function.
        return () => {
            if (audioRef.current) {
                // Pause the audio and revoke the Blob URL to release memory.
                audioRef.current.pause();
                URL.revokeObjectURL(audioRef.current.src);
                audioRef.current = null;
            }
        };
    }, [text]); // Re-run the effect and its cleanup if the text changes.

    const handlePlayPause = useCallback(async () => {
        if (!apiKey) {
            console.error("ElevenLabs API key is not configured.");
            return;
        }

        // If audio is already playing, pause it.
        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
            return;
        }

        // If audio is loaded but paused, resume playing.
        if (audioRef.current) {
            audioRef.current.play();
            setIsPlaying(true);
            return;
        }

        // If no audio is loaded, fetch it from the ElevenLabs API.
        setIsFetching(true);
        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_multilingual_v2',
                    voice_settings: { stability: 0.5, similarity_boost: 0.75 },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch audio from ElevenLabs.');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => setIsPlaying(false);

            audio.play();
            setIsPlaying(true);
        } catch (error) {
            console.error("Error fetching or playing audio:", error);
        } finally {
            setIsFetching(false);
        }
    }, [text, isPlaying, apiKey]);

    const handleStop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, []);

    const getStatusText = () => {
        if (isFetching) return "Generating...";
        if (isPlaying) return "Playing...";
        if (audioRef.current) return "Paused";
        return "Listen to summary";
    };

    return (
        <div className="flex items-center space-x-2 pt-4 border-t border-base-300">
            <button
                onClick={handlePlayPause}
                disabled={isFetching}
                className="p-2 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            {audioRef.current && (
                <button
                    onClick={handleStop}
                    className="p-2 rounded-full transition-colors cursor-pointer"
                >
                    <StopIcon />
                </button>
            )}
            <span className="text-sm text-text-secondary">{getStatusText()}</span>
        </div>
    );
};