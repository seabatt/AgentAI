'use client';

import { useState } from 'react';
import { Box, Text, SimpleGrid, Image, Flex, Spinner } from '@chakra-ui/react';

interface ResultsDisplayProps {
  images: (string | null)[];
  isGenerating: boolean;
  onGenerateMore: () => void;
  onStartOver: () => void;
}

export function ResultsDisplay({
  images,
  isGenerating,
  onGenerateMore,
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
      <Text
        fontSize="18px"
        fontWeight="700"
        color="#0f172a"
        textAlign="center"
        mb={6}
        m={0}
        pb={6}
      >
        Your Headshots
      </Text>

      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
        {images.map((img, i) => (
          <Box
            key={i}
            as={img ? 'button' : 'div'}
            onClick={img ? () => setSelectedIndex(i) : undefined}
            borderRadius="12px"
            border="2px solid"
            borderColor={
              img && i === selectedIndex ? '#3b82f6' : '#e2e8f0'
            }
            overflow="hidden"
            cursor={img ? 'pointer' : 'default'}
            transition="all 0.15s ease"
            _hover={img ? { borderColor: '#3b82f6' } : undefined}
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
                <Text fontSize="13px" color="#94a3b8" m={0}>
                  Generating...
                </Text>
              </Flex>
            )}
          </Box>
        ))}
      </SimpleGrid>

      {completedImages.length > 0 && !isGenerating && (
        <Flex direction="column" gap={3}>
          <Box
            as="button"
            onClick={handleDownload}
            w="100%"
            py={3}
            bg="#D96C4F"
            color="white"
            borderRadius="8px"
            fontSize="16px"
            fontWeight="600"
            cursor="pointer"
            border="none"
            _hover={{ bg: '#d95632' }}
            textAlign="center"
          >
            Download High-Res
          </Box>
          <Box
            as="button"
            onClick={onGenerateMore}
            w="100%"
            py={3}
            bg="white"
            color="#334155"
            borderRadius="8px"
            fontSize="14px"
            fontWeight="500"
            cursor="pointer"
            border="1px solid #e2e8f0"
            _hover={{ bg: '#f8fafc' }}
            textAlign="center"
          >
            Generate More
          </Box>
          <Box
            as="button"
            onClick={onStartOver}
            w="100%"
            py={2}
            bg="transparent"
            color="#94a3b8"
            borderRadius="8px"
            fontSize="13px"
            fontWeight="500"
            cursor="pointer"
            border="none"
            _hover={{ color: '#64748b' }}
            textAlign="center"
          >
            Start Over
          </Box>
        </Flex>
      )}
    </Box>
  );
}
