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
      gap="6px"
      p="12px"
      borderRadius="12px"
      border="2px solid"
      borderColor={isSelected ? '#0777e6' : '#e8e6e2'}
      bg={isSelected ? '#eff6ff' : 'white'}
      cursor="pointer"
      transition="all 0.15s ease"
      _hover={{
        borderColor: isSelected ? '#0777e6' : '#c4c2be',
        bg: isSelected ? '#eff6ff' : '#f9f8f6',
      }}
      minH="76px"
      w="100%"
      textAlign="center"
    >
      <Text fontSize="24px" lineHeight="1" m={0}>
        {icon}
      </Text>
      <Text
        fontSize="13px"
        fontWeight={isSelected ? '600' : '500'}
        color={isSelected ? '#0777e6' : '#0a1b22'}
        m={0}
      >
        {label}
      </Text>
    </Box>
  );
}
