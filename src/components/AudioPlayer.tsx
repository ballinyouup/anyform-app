"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaControlBarProps {
  className?: string
  text: string
}

export function MediaControlBar({ className, text }: MediaControlBarProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState([75])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
  const voiceId = '21m00Tcm4TlvDq8ikWAM' // Rachel

  // Cleanup when component unmounts or text changes
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        URL.revokeObjectURL(audioRef.current.src)
        audioRef.current = null
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [text])

  // Update progress when audio is playing
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      intervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(Math.floor(audioRef.current.currentTime))
          if (audioRef.current.currentTime >= audioRef.current.duration) {
            setIsPlaying(false)
            setCurrentTime(0)
          }
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying])

  // Update volume when slider changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100
    }
  }, [volume])

  const handlePlayPause = useCallback(async () => {
    if (!apiKey) {
      console.error("ElevenLabs API key is not configured.")
      return
    }

    // If audio is already playing, pause it
    if (isPlaying) {
      audioRef.current?.pause()
      setIsPlaying(false)
      return
    }

    // If audio is loaded but paused, resume playing
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
      return
    }

    // If no audio is loaded, fetch it from ElevenLabs API
    setIsFetching(true)
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
      })

      if (!response.ok) {
        throw new Error('Failed to fetch audio from ElevenLabs.')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onloadedmetadata = () => {
        setDuration(Math.floor(audio.duration))
      }

      audio.onended = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }

      audio.volume = volume[0] / 100
      audio.play()
      setIsPlaying(true)
    } catch (error) {
      console.error("Error fetching or playing audio:", error)
    } finally {
      setIsFetching(false)
    }
  }, [text, isPlaying, apiKey, volume])

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getButtonContent = () => {
    if (isFetching) return <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
    return isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />
  }

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-full shadow-lg",
        "bg-white",
        "backdrop-blur-sm border border-slate-200",
        className,
      )}
    >
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlayPause}
        disabled={isFetching}
        className="h-10 w-10 rounded-full bg-accent hover:bg-accent/80 text-accent-foreground transition-colors disabled:opacity-50"
      >
        {getButtonContent()}
      </Button>

      {/* Progress Bar */}
      <div className="flex-1 flex items-center gap-3">
        <span className="text-sm text-black font-mono min-w-[40px]">{formatTime(currentTime)}</span>
        <Slider
          value={[currentTime]}
          max={duration || 180}
          step={1}
          onValueChange={handleProgressChange}
          disabled={!audioRef.current}
          className="flex-1 [&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent [&_.slider-track]:bg-accent [&_.slider-range]:bg-accent"
        />
        <span className="text-sm text-black font-mono min-w-[40px]">{formatTime(duration)}</span>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2">
        <Volume2 className="h-4 w-4 text-black" />
        <Slider
          value={volume}
          max={100}
          step={1}
          onValueChange={handleVolumeChange}
          className="w-20 [&_[role=slider]]:bg-accent [&_[role=slider]]:border-accent [&_.slider-track]:bg-accent [&_.slider-range]:bg-accent"
        />
      </div>
    </div>
  )
}

// Keep the old export name for backward compatibility
export const AudioPlayer = MediaControlBar