import { NextRequest, NextResponse } from 'next/server';
import { GENERATION_CONFIG } from '@/lib/generation-config';

export const runtime = 'nodejs';
export const maxDuration = 300;

const GEMINI_MODEL = 'gemini-3-pro-image-preview';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MODERATION_MODEL = 'gemini-2.0-flash';
const MODERATION_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODERATION_MODEL}:generateContent`;

type GenerateResult = {
  image: string | null;
  error: string | null;
  blocked?: boolean;
};

type ReferenceImage = { base64: string; mimeType: string };

const SOFT_TIME_BUDGET_MS = 150_000;
const PER_REQUEST_TIMEOUT_MS = 120_000;

const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

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

        generateAndModerate(apiKey, prompt, referenceImages, controller.signal)
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
    let blockedCount = 0;
    for (const r of results) {
      if (!r) continue;
      if (r.blocked) blockedCount++;
      if (r.image) images.push(r.image);
      if (r.error) errors.push(r.error);
    }

    if (images.length < GENERATION_CONFIG.variations.min) {
      const detail = blockedCount > 0
        ? `${blockedCount} image(s) were flagged by our safety review and removed.`
        : errors.length ? `Details: ${errors[0]}` : null;

      return NextResponse.json(
        {
          success: false,
          error: [
            "We couldn't generate your headshots. Please try again or use a different photo.",
            detail,
          ]
            .filter(Boolean)
            .join(' '),
          blockedCount,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images,
      ...(blockedCount > 0 && { blockedCount }),
    });
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

// ---------------------------------------------------------------------------
// Layer 1: Generation with inline Gemini safety settings
// ---------------------------------------------------------------------------

const MAX_RETRIES = 5;
const RETRYABLE_STATUS = new Set([429, 503]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitteredDelay(baseMs: number): number {
  return baseMs + Math.random() * baseMs * 0.5;
}

async function generateAndModerate(
  apiKey: string,
  prompt: string,
  referenceImages: ReferenceImage[],
  signal: AbortSignal
): Promise<GenerateResult> {
  const result = await generateWithNanoBananaPro(apiKey, prompt, referenceImages, signal);

  if (!result.image || result.blocked) return result;

  const modResult = await moderateImage(apiKey, result.image, signal);
  if (!modResult.safe) {
    console.warn(`Image blocked by moderation: ${modResult.reason}`);
    return { image: null, error: modResult.reason, blocked: true };
  }

  return result;
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

  const body = JSON.stringify({
    contents: [
      {
        parts: [
          { text: prompt },
          ...imageParts,
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      imageConfig: {
        aspectRatio: GENERATION_CONFIG.aspectRatio,
        imageSize: GENERATION_CONFIG.imageSize,
      },
    },
    safetySettings: SAFETY_SETTINGS,
  });

  let lastError = '';

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (signal.aborted) {
      return { image: null, error: 'Request aborted.' };
    }

    if (attempt > 0) {
      const baseDelay = Math.min(3000 * Math.pow(2, attempt - 1), 30_000);
      const delayMs = Math.round(jitteredDelay(baseDelay));
      console.log(`Gemini retry ${attempt}/${MAX_RETRIES} after ${delayMs}ms...`);
      await sleep(delayMs);
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      lastError = `Gemini API error (HTTP ${response.status}). ${errorText.trim().slice(0, 300)}`;
      console.error(`Gemini API error ${response.status} (attempt ${attempt + 1}):`, errorText.slice(0, 200));

      if (RETRYABLE_STATUS.has(response.status) && attempt < MAX_RETRIES) {
        continue;
      }
      return { image: null, error: lastError };
    }

    const data = await response.json();

    // Layer 1 check: Gemini's built-in safety blocked the response
    const candidate = data.candidates?.[0];
    if (candidate?.finishReason === 'SAFETY') {
      const categories = (candidate.safetyRatings || [])
        .filter((r: any) => r.blocked)
        .map((r: any) => r.category)
        .join(', ');
      console.warn(`Generation blocked by Gemini safety filter: ${categories}`);
      return {
        image: null,
        error: 'Image was blocked by safety filters.',
        blocked: true,
      };
    }

    if (!candidate?.content?.parts) {
      const blockReason = data.promptFeedback?.blockReason;
      if (blockReason) {
        console.warn(`Prompt blocked by Gemini: ${blockReason}`);
        return {
          image: null,
          error: `Prompt blocked by safety filters (${blockReason}).`,
          blocked: true,
        };
      }
      return { image: null, error: 'Gemini response missing candidates content parts.' };
    }

    for (const part of candidate.content.parts) {
      const inline = part.inline_data || part.inlineData;
      if (inline?.data) {
        const imgMime = inline.mime_type || inline.mimeType || 'image/png';
        return { image: `data:${imgMime};base64,${inline.data}`, error: null };
      }
    }

    return { image: null, error: 'Gemini response did not include inline image data.' };
  }

  return { image: null, error: lastError || 'Max retries exceeded.' };
}

// ---------------------------------------------------------------------------
// Layer 2: Post-generation moderation via Gemini vision
// ---------------------------------------------------------------------------

type ModerationResult = { safe: boolean; reason: string };

async function moderateImage(
  apiKey: string,
  imageDataUrl: string,
  signal: AbortSignal
): Promise<ModerationResult> {
  try {
    const [header, base64Data] = imageDataUrl.split(',');
    const mimeMatch = header.match(/data:([^;]+)/);
    const mimeType = mimeMatch?.[1] || 'image/png';

    const body = JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: [
                'You are a content safety reviewer. Analyze this image and determine if it is safe for a professional headshot service.',
                'Flag the image as UNSAFE if it contains any of the following:',
                '- Nudity or sexually suggestive content',
                '- Violence, gore, or disturbing imagery',
                '- Hate symbols or offensive gestures',
                '- Content inappropriate for a professional workplace',
                '',
                'Respond with EXACTLY one line in this format:',
                'SAFE or UNSAFE: <brief reason>',
              ].join('\n'),
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 100,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      ],
    });

    const response = await fetch(`${MODERATION_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body,
    });

    if (!response.ok) {
      console.error(`Moderation API error (${response.status})`);
      return { safe: true, reason: 'Moderation check failed — allowing by default.' };
    }

    const data = await response.json();
    const text: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const normalized = text.trim().toUpperCase();

    if (normalized.startsWith('UNSAFE')) {
      return { safe: false, reason: text.trim() };
    }

    return { safe: true, reason: text.trim() };
  } catch (err) {
    console.error('Moderation error:', err);
    return { safe: true, reason: 'Moderation check errored — allowing by default.' };
  }
}
