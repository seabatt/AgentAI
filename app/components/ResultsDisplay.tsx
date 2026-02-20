'use client';

import { useState } from 'react';
import { Box, SimpleGrid, Image, Flex, Spinner, Text } from '@chakra-ui/react';
import { AgentAIButton, AgentAISection } from '@agentai/appsdk';
import { LuCheck } from 'react-icons/lu';

interface ResultsDisplayProps {
  images: (string | null)[];
  isGenerating: boolean;
  onStartOver: () => void;
}

export function ResultsDisplay({
  images,
  isGenerating,
  onStartOver,
}: ResultsDisplayProps) {
  const completedImages = images.filter((img): img is string => img !== null);
  const [selected, setSelected] = useState<Set<number>>(() => {
    return new Set(completedImages.map((_, i) => i));
  });

  function toggleSelect(index: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  function handleDownload() {
    const sorted = Array.from(selected).sort((a, b) => a - b);
    for (const idx of sorted) {
      const url = completedImages[idx];
      if (!url) continue;
      const link = document.createElement('a');
      link.href = url;
      link.download = `headshot-${idx + 1}.png`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  const selectedCount = selected.size;

  return (
    <Box>
      <AgentAISection title="Your headshots" accent="blue">
        {!isGenerating && completedImages.length > 0 && (
          <Text fontSize="13px" color="#64748b" mb={3}>
            Tap to select which headshots to download
          </Text>
        )}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={2}>
          {images.map((img, i) => {
            const isCompleted = img !== null;
            const completedIdx = isCompleted
              ? completedImages.indexOf(img)
              : -1;
            const isSelected = completedIdx >= 0 && selected.has(completedIdx);

            return (
              <Box
                key={i}
                as={isCompleted ? 'button' : 'div'}
                onClick={
                  isCompleted && completedIdx >= 0
                    ? () => toggleSelect(completedIdx)
                    : undefined
                }
                position="relative"
                borderRadius="12px"
                border="2px solid"
                borderColor={isSelected ? '#4f46e5' : '#e2e8f0'}
                overflow="hidden"
                cursor={isCompleted ? 'pointer' : 'default'}
                transition="all 0.15s ease"
                _hover={isCompleted ? { borderColor: '#4f46e5' } : undefined}
                bg={isCompleted ? 'white' : '#f8fafc'}
                aspectRatio="1"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {isCompleted ? (
                  <>
                    <Image
                      src={img}
                      alt={`Headshot variation ${i + 1}`}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      opacity={isSelected ? 1 : 0.5}
                      transition="opacity 0.15s ease"
                    />
                    {isSelected && (
                      <Box
                        position="absolute"
                        top={2}
                        right={2}
                        bg="#4f46e5"
                        borderRadius="full"
                        w="28px"
                        h="28px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="0 2px 8px rgba(0,0,0,0.2)"
                      >
                        <LuCheck size={16} color="white" />
                      </Box>
                    )}
                  </>
                ) : (
                  <Flex direction="column" align="center" gap={2}>
                    <Spinner size="md" color="#94a3b8" />
                    <Box fontSize="13px" color="#94a3b8">
                      Generating...
                    </Box>
                  </Flex>
                )}
              </Box>
            );
          })}
        </SimpleGrid>
      </AgentAISection>

      {completedImages.length > 0 && !isGenerating && (
        <Flex direction="column" gap={3} mt={4}>
          <AgentAIButton
            variant="primary"
            size="lg"
            isDisabled={selectedCount === 0}
            onClick={handleDownload}
          >
            {selectedCount === 0
              ? 'Select images to download'
              : selectedCount === 1
                ? 'Download 1 image'
                : `Download ${selectedCount} images`}
          </AgentAIButton>
          <AgentAIButton variant="tertiary" onClick={onStartOver}>
            Try a different style
          </AgentAIButton>
        </Flex>
      )}
    </Box>
  );
}
