'use client';

import { useState, useCallback } from 'react';
import { ChakraProvider, Box, Text, Spinner } from '@chakra-ui/react';
import { PhotoUpload } from './components/PhotoUpload';
import { SelectionGrid } from './components/SelectionGrid';
import { ValidationBanner } from './components/ValidationBanner';
import { ResultsDisplay } from './components/ResultsDisplay';
import {
  HEADSHOT_CATEGORIES,
  getMissingCategories,
  allRequiredSelected,
} from '@/lib/headshot-config';
import { GENERATION_CONFIG } from '@/lib/generation-config';
import { buildVariationPrompts } from '@/lib/prompt-builder';

type AppState = 'input' | 'generating' | 'results';

export default function HeadshotGenerator() {
  const [appState, setAppState] = useState<AppState>('input');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, string | null>>(
    {}
  );
  const [images, setImages] = useState<(string | null)[]>([]);
  const [error, setError] = useState<string | null>(null);

  const missingCategories = getMissingCategories(selections);
  const isReady = !!photoFile && allRequiredSelected(selections);

  function handleFileSelect(file: File) {
    setPhotoFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError(null);
  }

  function handleRemovePhoto() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhotoFile(null);
    setPreviewUrl(null);
  }

  function handleSelect(categoryId: string, optionId: string) {
    setSelections((prev) => ({ ...prev, [categoryId]: optionId }));
  }

  const handleGenerate = useCallback(async () => {
    if (!photoFile || !isReady) return;

    setAppState('generating');
    setError(null);

    const validSelections = selections as Record<string, string>;
    const prompts = buildVariationPrompts(validSelections);
    const placeholders: (string | null)[] = prompts.map(() => null);
    setImages([...placeholders]);

    const formData = new FormData();
    formData.append('photo', photoFile);
    formData.append('prompts', JSON.stringify(prompts));

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error || 'Generation failed. Please try again.'
        );
      }

      if (
        data.images.length < GENERATION_CONFIG.variations.min
      ) {
        throw new Error(
          "We couldn't generate your headshots. Please try again or use a different photo."
        );
      }

      setImages(data.images);
      setAppState('results');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      );
      setAppState('input');
    }
  }, [photoFile, isReady, selections]);

  function handleGenerateMore() {
    handleGenerate();
  }

  function handleStartOver() {
    handleRemovePhoto();
    setSelections({});
    setImages([]);
    setError(null);
    setAppState('input');
  }

  return (
    <ChakraProvider>
      <Box
        minH="100vh"
        bg="#f1f5f9"
        display="flex"
        alignItems="flex-start"
        justifyContent="center"
        py={{ base: 4, md: 10 }}
        px={4}
      >
        <Box
          bg="white"
          borderRadius="16px"
          boxShadow="0 4px 6px rgba(0, 0, 0, 0.07)"
          maxW="520px"
          w="100%"
          p={{ base: 5, md: 8 }}
        >
          {/* Header */}
          <Box textAlign="center" mb={6}>
            <Text
              fontSize="22px"
              fontWeight="700"
              color="#0f172a"
              m={0}
              mb={1}
            >
              AI Headshot Generator
            </Text>
            <Text fontSize="14px" color="#64748b" m={0}>
              Upload a selfie. Pick your look. Get 3 professional headshots.
            </Text>
          </Box>

          {/* Error */}
          {error && (
            <Box
              bg="#fef2f2"
              border="1px solid #fecaca"
              borderRadius="8px"
              px={4}
              py={3}
              mb={4}
            >
              <Text fontSize="14px" color="#991b1b" m={0}>
                {error}
              </Text>
            </Box>
          )}

          {/* Input State */}
          {appState === 'input' && (
            <>
              <PhotoUpload
                previewUrl={previewUrl}
                onFileSelect={handleFileSelect}
                onRemove={handleRemovePhoto}
              />

              {HEADSHOT_CATEGORIES.map((category) => (
                <SelectionGrid
                  key={category.id}
                  category={category}
                  selectedId={selections[category.id] ?? null}
                  onSelect={(optionId) =>
                    handleSelect(category.id, optionId)
                  }
                />
              ))}

              {!isReady && (
                <ValidationBanner
                  missingCategories={missingCategories}
                  hasPhoto={!!photoFile}
                />
              )}

              <Box
                as="button"
                onClick={handleGenerate}
                disabled={!isReady}
                w="100%"
                py={3}
                mt={2}
                bg={isReady ? '#3b82f6' : '#cbd5e0'}
                color="white"
                borderRadius="10px"
                fontSize="16px"
                fontWeight="600"
                cursor={isReady ? 'pointer' : 'not-allowed'}
                border="none"
                transition="all 0.15s ease"
                _hover={isReady ? { bg: '#2563eb' } : undefined}
                textAlign="center"
              >
                Generate Headshot 📸
              </Box>
            </>
          )}

          {/* Generating State */}
          {appState === 'generating' && (
            <ResultsDisplay
              images={images}
              isGenerating={true}
              onGenerateMore={handleGenerateMore}
              onStartOver={handleStartOver}
            />
          )}

          {/* Results State */}
          {appState === 'results' && (
            <ResultsDisplay
              images={images}
              isGenerating={false}
              onGenerateMore={handleGenerateMore}
              onStartOver={handleStartOver}
            />
          )}
        </Box>
      </Box>
    </ChakraProvider>
  );
}
