import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const text = searchParams.get('text')
    const lang = searchParams.get('lang') || 'en'

    if (!text) {
        return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    try {
        const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=gtx&tl=${lang}&q=${encodeURIComponent(text)}`

        // Fetch from Google TTS using a common User-Agent to prevent 403s
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })

        if (!response.ok) {
            throw new Error(`Google API responded with status: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': buffer.length.toString(),
                'Cache-Control': 'public, max-age=3600'
            }
        })
    } catch (error) {
        console.error('TTS Proxy Error:', error)
        return NextResponse.json({ error: 'Failed to fetch TTS audio' }, { status: 500 })
    }
}
