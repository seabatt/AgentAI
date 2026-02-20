'use client';

import { Box, Text } from '@chakra-ui/react';

interface SelectionCardProps {
  icon: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

export function SelectionCard({
  icon,
  label,
  isSelected,
  onClick,
}: SelectionCardProps) {
  return (
    <Box
      as="button"
      onClick={onClick}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      p={4}
      borderRadius="12px"
      border="2px solid"
      borderColor={isSelected ? '#3b82f6' : '#e2e8f0'}
      bg={isSelected ? '#eff6ff' : 'white'}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{
        borderColor: isSelected ? '#3b82f6' : '#cbd5e0',
        bg: isSelected ? '#eff6ff' : '#f8fafc',
      }}
      minH="80px"
      w="100%"
    >
      <Text fontSize="28px" lineHeight="1" m={0}>
        {icon}
      </Text>
      <Text
        fontSize="13px"
        fontWeight={isSelected ? '600' : '500'}
        color={isSelected ? '#1e40af' : '#334155'}
        textAlign="center"
        m={0}
      >
        {label}
      </Text>
    </Box>
  );
}
