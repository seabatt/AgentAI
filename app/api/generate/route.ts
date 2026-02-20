import { NextRequest, NextResponse } from 'next/server';
import { GENERATION_CONFIG } from '@/lib/generation-config';

export const runtime = 'nodejs';
export const maxDuration = 300;

const GEMINI_MODEL = 'gemini-3-pro-image-preview';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

type GenerateResult = { image: string | null; error: string | null };

type ReferenceImage = { base64: string; mimeType: string };

const SOFT_TIME_BUDGET_MS = 50_000;
const PER_REQUEST_TIMEOUT_MS = 45_000;

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
    const photoEntries = formData.getAll('photos') as File[];
    const promptsRaw = formData.get('prompts') as string | null;

    if (photoEntries.length === 0 || !promptsRaw) {
      return NextResponse.json(
        { success: false, error: 'Missing photos or prompts.' },
        { status: 400 }
      );
    }

    const prompts: string[] = JSON.parse(promptsRaw);

    const referenceImages: ReferenceImage[] = await Promise.all(
      photoEntries.map(async (photo) => {
        const bytes = await photo.arrayBuffer();
        return {
          base64: Buffer.from(bytes).toString('base64'),
          mimeType: photo.type || 'image/jpeg',
        };
      })
    );

    const controllers: AbortController[] = [];
    const results: Array<GenerateResult | null> = new Array(prompts.length).fill(null);
    let settledCount = 0;

    const allDone = new Promise<void>((resolve) => {
      prompts.forEach((prompt, i) => {
        const controller = new AbortController();
        controllers[i] = controller;

        const timeout = setTimeout(() => controller.abort(), PER_REQUEST_TIMEOUT_MS);

        generateWithNanoBananaPro(apiKey, prompt, referenceImages, controller.signal)
          .then((r) => {
            results[i] = r;
          })
          .catch((e) => {
            results[i] = {
              image: null,
              error: e instanceof Error ? e.message : 'Unknown generation error.',
            };
          })
          .finally(() => {
            clearTimeout(timeout);
            settledCount += 1;
            if (settledCount === prompts.length) resolve();
          });
      });
    });

    await Promise.race([
      allDone,
      new Promise<void>((resolve) => setTimeout(resolve, SOFT_TIME_BUDGET_MS)),
    ]);

    for (const c of controllers) c?.abort();

    const images: string[] = [];
    const errors: string[] = [];
    for (const r of results) {
      if (!r) continue;
      if (r.image) images.push(r.image);
      if (r.error) errors.push(r.error);
    }

    if (images.length < GENERATION_CONFIG.variations.min) {
      return NextResponse.json(
        {
          success: false,
          error: [
            "We couldn't generate your headshots. Please try again or use a different photo.",
            errors.length ? `Details: ${errors[0]}` : null,
          ]
            .filter(Boolean)
            .join(' '),
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
  referenceImages: ReferenceImage[],
  signal: AbortSignal
): Promise<GenerateResult> {
  const imageParts = referenceImages.map((img) => ({
    inline_data: {
      mime_type: img.mimeType,
      data: img.base64,
    },
  }));

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            ...imageParts,
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
    return {
      image: null,
      error: `Gemini API error (HTTP ${response.status}). ${errorText.trim().slice(0, 300)}`,
    };
  }

  const data = await response.json();

  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts) return { image: null, error: 'Gemini response missing candidates content parts.' };

  for (const part of parts) {
    const inline = part.inline_data || part.inlineData;
    if (inline?.data) {
      const imgMime = inline.mime_type || inline.mimeType || 'image/png';
      return { image: `data:${imgMime};base64,${inline.data}`, error: null };
    }
  }

  return { image: null, error: 'Gemini response did not include inline image data.' };
}
