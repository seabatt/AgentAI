'use client';

import { Box, Text } from '@chakra-ui/react';

interface ValidationBannerProps {
  missingCategories: string[];
  hasPhoto: boolean;
}

export function ValidationBanner({
  missingCategories,
  hasPhoto,
}: ValidationBannerProps) {
  let message: string;

  if (!hasPhoto && missingCategories.length > 0) {
    message = 'Upload a photo and choose a backdrop, attire, and color to continue.';
  } else if (!hasPhoto) {
    message = 'Upload a photo to get started.';
  } else if (missingCategories.length === 1) {
    message = `Choose a ${missingCategories[0]} to continue.`;
  } else if (missingCategories.length === 2) {
    message = `Choose a ${missingCategories[0]} and ${missingCategories[1]} to continue.`;
  } else {
    message = `Choose a ${missingCategories.slice(0, -1).join(', ')}, and ${missingCategories[missingCategories.length - 1]} to continue.`;
  }

  return (
    <Box
      bg="#fef9e7"
      border="1px solid #fde68a"
      borderRadius="8px"
      px={4}
      py={3}
      mb={4}
    >
      <Text fontSize="14px" color="#92400e" m={0}>
        {message}
      </Text>
    </Box>
  );
}
