import { NextRequest, NextResponse } from 'next/server';
import { GENERATION_CONFIG } from '@/lib/generation-config';

export const maxDuration = 60;

const GEMINI_MODEL = 'gemini-3-pro-image-preview';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'Server configuration error: missing GEMINI_API_KEY.' },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const photo = formData.get('photo') as File | null;
    const promptsRaw = formData.get('prompts') as string | null;

    if (!photo || !promptsRaw) {
      return NextResponse.json(
        { success: false, error: 'Missing photo or prompts.' },
        { status: 400 }
      );
    }

    const prompts: string[] = JSON.parse(promptsRaw);

    const bytes = await photo.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    const mimeType = photo.type || 'image/jpeg';

    const results = await Promise.allSettled(
      prompts.map((prompt) =>
        generateWithNanoBananaPro(apiKey, prompt, base64, mimeType)
      )
    );

    const images: string[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        images.push(result.value);
      }
    }

    if (images.length < GENERATION_CONFIG.variations.min) {
      return NextResponse.json(
        {
          success: false,
          error:
            "We couldn't generate your headshots. Please try again or use a different photo.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, images });
  } catch (err) {
    console.error('Generation error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Something went wrong during generation. Please try again.',
      },
      { status: 500 }
    );
  }
}

async function generateWithNanoBananaPro(
  apiKey: string,
  prompt: string,
  base64Image: string,
  mimeType: string
): Promise<string | null> {
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE'],
        imageConfig: {
          aspectRatio: GENERATION_CONFIG.aspectRatio,
          imageSize: GENERATION_CONFIG.imageSize,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Gemini API error ${response.status}:`, errorText);
    return null;
  }

  const data = await response.json();

  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts) return null;

  for (const part of parts) {
    if (part.inline_data?.data) {
      const imgMime = part.inline_data.mime_type || 'image/png';
      return `data:${imgMime};base64,${part.inline_data.data}`;
    }
  }

  return null;
}
