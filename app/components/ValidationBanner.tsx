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
    message = 'Upload at least one photo and pick a style to continue.';
  } else if (!hasPhoto) {
    message = 'Upload at least one photo to get started. More angles = better likeness.';
  } else {
    message = 'Pick a style to continue.';
  }

  return (
    <Box
      p="12px 16px"
      bg="#fef3c7"
      border="1px solid #fde68a"
      borderRadius="10px"
    >
      <Text fontSize="13px" fontWeight="600" color="#92400e" m={0}>
        Almost there
      </Text>
      <Text fontSize="13px" color="#92400e" m={0} mt="2px">
        {message}
      </Text>
    </Box>
  );
}
