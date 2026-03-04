'use client';

import { useState } from 'react';
import { Box, SimpleGrid, Image, Flex, Spinner, Text, Button } from '@chakra-ui/react';
import { LuCheck, LuDownload, LuRotateCcw } from 'react-icons/lu';

interface ResultsDisplayProps {
  images: (string | null)[];
  isGenerating: boolean;
  isHistoryView?: boolean;
  onStartOver: () => void;
}

const card = {
  bg: 'white',
  borderRadius: '16px',
  border: '1px solid',
  borderColor: '#f0eae2',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
} as const;

export function ResultsDisplay({
  images,
  isGenerating,
  isHistoryView = false,
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

  if (isGenerating) {
    return (
      <Flex direction="column" align="center" justify="center" minH="400px" gap="24px" py="64px" px="24px">
        <Box w="64px" h="64px" borderRadius="full" bg="#eff6ff" display="flex" alignItems="center" justifyContent="center">
          <Spinner size="lg" color="#0777e6" />
        </Box>
        <Box textAlign="center">
          <Text fontSize="20px" fontWeight="600" color="#0a1b22" m={0}>
            Creating your headshots
          </Text>
          <Text fontSize="14px" color="#64625e" m={0} mt="6px" maxW="400px">
            This usually takes 30–60 seconds. Hang tight.
          </Text>
        </Box>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="12px" w="100%" maxW="480px">
          {images.map((img, i) => (
            <Box
              key={i}
              borderRadius="12px"
              border="1px solid #e8e6e2"
              bg={img ? 'white' : '#f9f8f6'}
              aspectRatio="1"
              display="flex"
              alignItems="center"
              justifyContent="center"
              overflow="hidden"
            >
              {img ? (
                <Image src={img} alt={`Headshot ${i + 1}`} w="100%" h="100%" objectFit="cover" />
              ) : (
                <Flex direction="column" align="center" gap="6px">
                  <Spinner size="sm" color="#94928e" />
                  <Text fontSize="12px" color="#94928e" m={0}>Generating...</Text>
                </Flex>
              )}
            </Box>
          ))}
        </SimpleGrid>
      </Flex>
    );
  }

  return (
    <Box {...card} p="24px">
      {/* Success banner */}
      <Box bg="#eff6ff" borderLeft="4px solid #0777e6" borderRadius="0 10px 10px 0" p="12px 16px" mb="20px">
        <Text fontSize="13px" fontWeight="700" color="#0777e6" m={0}>
          {isHistoryView ? 'PREVIOUS SESSION' : 'HEADSHOTS READY'}
        </Text>
        <Text fontSize="14px" color="#374151" m={0} mt="2px">
          {isHistoryView
            ? 'These are preview thumbnails. Generate again to download full-resolution images.'
            : 'Tap to select which ones to download'}
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap="12px" mb="20px">
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
              borderColor={isSelected ? '#0777e6' : '#e8e6e2'}
              overflow="hidden"
              cursor={isCompleted ? 'pointer' : 'default'}
              transition="all 0.15s ease"
              _hover={isCompleted ? { borderColor: '#0777e6' } : undefined}
              bg={isCompleted ? 'white' : '#f9f8f6'}
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
                      top="8px"
                      right="8px"
                      bg="#0777e6"
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
                <Flex direction="column" align="center" gap="6px">
                  <Spinner size="md" color="#94928e" />
                  <Text fontSize="13px" color="#94928e" m={0}>
                    Generating...
                  </Text>
                </Flex>
              )}
            </Box>
          );
        })}
      </SimpleGrid>

      <Flex direction="column" gap="10px">
        {!isHistoryView && (
          <Button
            onClick={handleDownload}
            disabled={selectedCount === 0}
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
            <LuDownload size={16} style={{ marginRight: 8 }} />
            {selectedCount === 0
              ? 'Select images to download'
              : selectedCount === 1
                ? 'Download 1 image'
                : `Download ${selectedCount} images`}
          </Button>
        )}
        <Button
          onClick={onStartOver}
          variant="outline"
          border="1px solid #e8e6e2"
          color="#64625e"
          bg="white"
          borderRadius="12px"
          h="42px"
          fontSize="14px"
          fontWeight="500"
          w="100%"
          _hover={{ bg: '#f4f2ee', color: '#0a1b22' }}
          transition="all 0.15s ease"
        >
          <LuRotateCcw size={14} style={{ marginRight: 6 }} />
          {isHistoryView ? 'Generate new headshots' : 'Try a different style'}
        </Button>
      </Flex>
    </Box>
  );
}
