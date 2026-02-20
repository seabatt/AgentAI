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

const AGENT_ICON_DATA_URL =
  'data:image/svg+xml,%3Csvg%20xmlns=%22http%3A//www.w3.org/2000/svg%22%20width=%2296%22%20height=%2296%22%20viewBox=%220%200%2096%2096%22%3E%3Crect%20x=%228%22%20y=%2222%22%20width=%2280%22%20height=%2256%22%20rx=%2214%22%20fill=%22%23f8fafc%22%20stroke=%22%231A3643%22%20stroke-width=%224%22/%3E%3Cpath%20d=%22M30%2022%20l6-8%20h24%20l6%208%22%20fill=%22none%22%20stroke=%22%231A3643%22%20stroke-width=%224%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22/%3E%3Ccircle%20cx=%2248%22%20cy=%2250%22%20r=%2216%22%20fill=%22none%22%20stroke=%22%23D96C4F%22%20stroke-width=%224%22/%3E%3Ccircle%20cx=%2248%22%20cy=%2250%22%20r=%226%22%20fill=%22%23D96C4F%22/%3E%3C/svg%3E';

async function readJsonResponse<T = any>(response: Response): Promise<T> {
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

      const data = await readJsonResponse<{
        success: boolean;
        images?: string[];
        error?: string;
      }>(response);

      if (!data.success) {
        throw new Error(
          data.error || 'Generation failed. Please try again.'
        );
      }

      if (!Array.isArray(data.images)) {
        throw new Error(
          'Generation failed: server returned an invalid response shape (missing images array).'
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
        icon: AGENT_ICON_DATA_URL,
        description:
          'Upload a selfie. Pick your style. Get 3 professional headshots.',
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
