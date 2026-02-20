'use client';

import { useState, useCallback } from 'react';
import { Box } from '@chakra-ui/react';
import {
  AgentAIAgentPage,
  AgentAIAgentPageSection,
  AgentAIAlert,
  AgentAIButton,
  defaultTheme,
} from '@agentai/appsdk';
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
    <AgentAIAgentPage
      theme={defaultTheme}
      agentHeaderConfig={{
        name: 'AI Headshot Generator',
        description:
          'Upload a selfie. Pick your look. Get 3 professional headshots.',
        showStats: false,
        showActions: false,
        theme: defaultTheme,
      }}
      maxWidth="720px"
    >
      <AgentAIAgentPageSection spacing={6}>
        {error && (
          <AgentAIAlert
            status="error"
            title="Something went wrong"
            description={error}
          />
        )}

        {appState === 'input' && (
          <>
            <PhotoUpload
              previewUrl={previewUrl}
              onFileSelect={handleFileSelect}
              onRemove={handleRemovePhoto}
            />

            <Box display="flex" flexDirection="column" gap={6}>
              {HEADSHOT_CATEGORIES.map((category) => (
                <SelectionGrid
                  key={category.id}
                  category={category}
                  selectedId={selections[category.id] ?? null}
                  onSelect={(optionId) => handleSelect(category.id, optionId)}
                />
              ))}
            </Box>

            {!isReady && (
              <ValidationBanner
                missingCategories={missingCategories}
                hasPhoto={!!photoFile}
              />
            )}

            <AgentAIButton
              variant="primary"
              size="lg"
              isDisabled={!isReady}
              onClick={handleGenerate}
            >
              Generate headshots
            </AgentAIButton>
          </>
        )}

        {appState === 'generating' && (
          <ResultsDisplay
            images={images}
            isGenerating={true}
            onGenerateMore={handleGenerateMore}
            onStartOver={handleStartOver}
          />
        )}

        {appState === 'results' && (
          <ResultsDisplay
            images={images}
            isGenerating={false}
            onGenerateMore={handleGenerateMore}
            onStartOver={handleStartOver}
          />
        )}
      </AgentAIAgentPageSection>
    </AgentAIAgentPage>
  );
}
