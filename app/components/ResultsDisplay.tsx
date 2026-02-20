'use client';

import { useState } from 'react';
import { Box, SimpleGrid, Image, Flex, Spinner } from '@chakra-ui/react';
import { AgentAIButton, AgentAISection } from '@agentai/appsdk';

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
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const completedImages = images.filter((img): img is string => img !== null);

  function handleDownload() {
    const url = completedImages[selectedIndex];
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = `headshot-${selectedIndex + 1}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Box>
      <AgentAISection title="Your headshots" accent="blue">
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={2}>
          {images.map((img, i) => (
            <Box
              key={i}
              as={img ? 'button' : 'div'}
              onClick={img ? () => setSelectedIndex(i) : undefined}
              borderRadius="12px"
              border="2px solid"
              borderColor={
                img && i === selectedIndex ? '#4f46e5' : '#e2e8f0'
              }
              overflow="hidden"
              cursor={img ? 'pointer' : 'default'}
              transition="all 0.15s ease"
              _hover={img ? { borderColor: '#4f46e5' } : undefined}
              bg={img ? 'white' : '#f8fafc'}
              aspectRatio="1"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {img ? (
                <Image
                  src={img}
                  alt={`Headshot variation ${i + 1}`}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
              ) : (
                <Flex direction="column" align="center" gap={2}>
                  <Spinner size="md" color="#94a3b8" />
                  <Box fontSize="13px" color="#94a3b8">
                    Generating...
                  </Box>
                </Flex>
              )}
            </Box>
          ))}
        </SimpleGrid>
      </AgentAISection>

      {completedImages.length > 0 && !isGenerating && (
        <Flex direction="column" gap={3} mt={4}>
          <AgentAIButton variant="primary" size="lg" onClick={handleDownload}>
            Download high-res
          </AgentAIButton>
          <AgentAIButton variant="tertiary" onClick={onStartOver}>
            Try a different style
          </AgentAIButton>
        </Flex>
      )}
    </Box>
  );
}
