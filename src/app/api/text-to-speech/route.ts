import { NextRequest, NextResponse } from 'next/server'
import "dotenv"
export async function POST(request: NextRequest) {
  try {
    console.log('Text-to-speech API called')
    const { text, voiceId = '21m00Tcm4TlvDq8ikWAM' } = await request.json()
    console.log('Request data:', { text: text?.substring(0, 100) + '...', voiceId })

    if (!text) {
      console.error('No text provided in request')
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    console.log('API key status:', apiKey ? 'Present' : 'Missing')

    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY is not configured')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    console.log('Making request to ElevenLabs API...')
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

    console.log('ElevenLabs API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }

    const audioBuffer = await response.arrayBuffer()
    console.log('Audio buffer received, size:', audioBuffer.byteLength)
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    })
  } catch (error) {
    console.error('Text-to-speech API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
