'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, VStack, Text, Flex, Button } from '@chakra-ui/react';
import { LuCamera } from 'react-icons/lu';
import { PhotoUpload } from './components/PhotoUpload';
import { SelectionGrid } from './components/SelectionGrid';
import { ValidationBanner } from './components/ValidationBanner';
import { ResultsDisplay } from './components/ResultsDisplay';
import { HeadshotSidebar } from './components/HeadshotSidebar';
import {
  HEADSHOT_CATEGORIES,
  getMissingCategories,
  allRequiredSelected,
} from '@/lib/headshot-config';
import { GENERATION_CONFIG } from '@/lib/generation-config';
import { buildVariationPrompts } from '@/lib/prompt-builder';
import {
  getSessions,
  saveSession,
  deleteSession,
  getSessionById,
  type HeadshotSession,
} from '@/lib/session-store';

type AppState = 'input' | 'generating' | 'results';

const MAX_REF_DIM = 1024;
const JPEG_QUALITY = 0.85;
const THUMB_DIM = 80;

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_REF_DIM || height > MAX_REF_DIM) {
        const scale = MAX_REF_DIM / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/jpeg',
        JPEG_QUALITY
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => reject(new Error('Failed to load image for resize'));
    img.src = URL.createObjectURL(file);
  });
}

function makeThumbnail(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = THUMB_DIM;
      canvas.height = THUMB_DIM;
      const ctx = canvas.getContext('2d')!;
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, THUMB_DIM, THUMB_DIM);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = () => resolve('');
    img.src = dataUrl;
  });
}

async function readJsonResponse<T = unknown>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  const snippet = text.trim().slice(0, 300);
  throw new Error(
    `Non-JSON response from /api/generate (HTTP ${response.status}). ${snippet || 'Empty response.'}`
  );
}

const card = {
  bg: 'white',
  borderRadius: '16px',
  border: '1px solid',
  borderColor: '#f0eae2',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
} as const;

export default function HeadshotGenerator() {
  const [appState, setAppState] = useState<AppState>('input');
  const [photos, setPhotos] = useState<{ file: File; previewUrl: string }[]>([]);
  const [selections, setSelections] = useState<Record<string, string | null>>({});
  const [images, setImages] = useState<(string | null)[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [sessions, setSessions] = useState<HeadshotSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    setSessions(getSessions());
  }, []);

  const missingCategories = getMissingCategories(selections);
  const hasPhotos = photos.length > 0;
  const isReady = hasPhotos && allRequiredSelected(selections);

  function handleAddPhotos(files: File[]) {
    const newPhotos = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    setError(null);
  }

  function handleRemovePhoto(index: number) {
    setPhotos((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleSelect(categoryId: string, optionId: string) {
    setSelections((prev) => ({ ...prev, [categoryId]: optionId }));
  }

  function getSelectedStyleName(): string {
    const styleId = selections['style'];
    if (!styleId) return 'Headshot';
    const cat = HEADSHOT_CATEGORIES.find((c) => c.id === 'style');
    const opt = cat?.options.find((o) => o.id === styleId);
    return opt?.label ?? 'Headshot';
  }

  const handleGenerate = useCallback(async () => {
    if (!hasPhotos || !isReady) return;

    setAppState('generating');
    setError(null);
    setActiveSessionId(null);

    const validSelections = selections as Record<string, string>;
    const prompts = buildVariationPrompts(validSelections);
    const placeholders: (string | null)[] = prompts.map(() => null);
    setImages([...placeholders]);

    const formData = new FormData();
    const resized = await Promise.all(photos.map((p) => resizeImage(p.file)));
    for (let i = 0; i < resized.length; i++) {
      formData.append('photos', resized[i], `photo-${i}.jpg`);
    }
    formData.append('prompts', JSON.stringify(prompts));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await readJsonResponse<{
        success: boolean;
        images?: string[];
        error?: string;
        blockedCount?: number;
      }>(response);

      if (!data.success) {
        throw new Error(data.error || 'Generation failed. Please try again.');
      }

      if (!Array.isArray(data.images)) {
        throw new Error('Generation failed: server returned an invalid response shape.');
      }

      if (data.images.length < GENERATION_CONFIG.variations.min) {
        throw new Error("We couldn't generate your headshots. Please try again or use a different photo.");
      }

      setImages(data.images);
      setAppState('results');

      if (data.blockedCount && data.blockedCount > 0) {
        setError(`${data.blockedCount} image(s) were removed by our safety review. The remaining images passed all checks.`);
      }

      const thumbs = await Promise.all(
        data.images.slice(0, 3).map((img) => makeThumbnail(img))
      );

      const saved = saveSession({
        styleName: getSelectedStyleName(),
        styleId: validSelections['style'] ?? '',
        thumbnails: thumbs.filter(Boolean),
        imageCount: data.images.length,
      });
      setActiveSessionId(saved.id);
      setSessions(getSessions());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
      setAppState('input');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos, hasPhotos, isReady, selections]);

  function handleStartOver() {
    setSelections({});
    setImages([]);
    setError(null);
    setActiveSessionId(null);
    setAppState('input');
  }

  function handleNewSession() {
    for (const p of photos) URL.revokeObjectURL(p.previewUrl);
    setPhotos([]);
    setSelections({});
    setImages([]);
    setError(null);
    setActiveSessionId(null);
    setAppState('input');
  }

  function handleViewSession(id: string) {
    const session = getSessionById(id);
    if (!session) return;
    setActiveSessionId(id);
    setImages(session.thumbnails);
    setAppState('results');
    setError(null);
  }

  function handleDeleteSession(id: string) {
    deleteSession(id);
    setSessions(getSessions());
    if (activeSessionId === id) {
      handleNewSession();
    }
  }

  return (
    <Flex minH="100vh" bg="#faf9f7">
      {/* Sidebar */}
      <HeadshotSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onViewSession={handleViewSession}
        onDeleteSession={handleDeleteSession}
        onNewSession={handleNewSession}
      />

      {/* Main content pane */}
      <Box flex="1" minW="0" p={{ base: '0', lg: '16px' }} overflow="auto">
        <Box
          bg="white"
          borderRadius={{ base: '0', lg: '30px' }}
          boxShadow="0px 5px 20px 0px rgba(0,0,0,0.05)"
          minH={{ base: '100vh', lg: 'calc(100vh - 32px)' }}
          display="flex"
          flexDirection="column"
          overflow="hidden"
        >
          <Box flex="1" display="flex" justifyContent="center" alignItems="flex-start" overflow="auto">
            <Box w="100%" maxW="960px" px="32px" py="40px">
              <VStack gap="24px" align="stretch">
                {/* Header */}
                <VStack gap="8px" align="center" textAlign="center">
                  <Text fontSize="32px" fontWeight="700" color="#0a1b22" m={0} lineHeight="1.2">
                    Instant Headshot Generator
                  </Text>
                  <Text fontSize="16px" color="#64625e" m={0} lineHeight="1.5" maxW="560px">
                    Upload up to 3 selfies, pick your style, get your headshot. It&apos;s that easy.
                  </Text>
                </VStack>

            {/* Error / moderation banner */}
            {error && appState !== 'results' && (
              <Box p="12px 16px" bg="#fef2f2" border="1px solid #fecaca" borderRadius="10px">
                <Text fontSize="13px" fontWeight="600" color="#991b1b" m={0}>Something went wrong</Text>
                <Text fontSize="13px" color="#991b1b" m={0} mt="2px">{error}</Text>
              </Box>
            )}
            {error && appState === 'results' && (
              <Box p="12px 16px" bg="#fef3c7" border="1px solid #fde68a" borderRadius="10px">
                <Text fontSize="13px" fontWeight="600" color="#92400e" m={0}>Safety review</Text>
                <Text fontSize="13px" color="#92400e" m={0} mt="2px">{error}</Text>
              </Box>
            )}

            {appState === 'input' && (
              <Box {...card} p="24px">
                <VStack gap="20px" align="stretch">
                  <PhotoUpload
                    photos={photos}
                    onAddPhotos={handleAddPhotos}
                    onRemove={handleRemovePhoto}
                  />

                  {HEADSHOT_CATEGORIES.map((category) => (
                    <SelectionGrid
                      key={category.id}
                      category={category}
                      selectedId={selections[category.id] ?? null}
                      onSelect={(optionId) => handleSelect(category.id, optionId)}
                    />
                  ))}

                  {!isReady && (
                    <ValidationBanner
                      missingCategories={missingCategories}
                      hasPhoto={hasPhotos}
                    />
                  )}

                  <Button
                    onClick={handleGenerate}
                    disabled={!isReady}
                    bg="#0777e6"
                    color="white"
                    px="28px"
                    h="46px"
                    borderRadius="12px"
                    fontSize="15px"
                    fontWeight="600"
                    w="100%"
                    _hover={{ bg: '#0660b9' }}
                    _disabled={{ bg: '#c9c4bd', cursor: 'not-allowed' }}
                    transition="all 0.15s ease"
                  >
                    <LuCamera size={16} style={{ marginRight: 8 }} /> Generate Headshots
                  </Button>
                </VStack>
              </Box>
            )}

            {(appState === 'generating' || appState === 'results') && (
              <ResultsDisplay
                images={images}
                isGenerating={appState === 'generating'}
                onStartOver={handleStartOver}
              />
            )}
              </VStack>
            </Box>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
}
