'use client';

import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import { SelectionCard } from './SelectionCard';
import type { SelectionCategory } from '@/lib/headshot-config';

interface SelectionGridProps {
  category: SelectionCategory;
  selectedId: string | null;
  onSelect: (optionId: string) => void;
}

export function SelectionGrid({
  category,
  selectedId,
  onSelect,
}: SelectionGridProps) {
  return (
    <Box>
      <Text fontSize="13px" fontWeight="600" color="#0a1b22" mb="8px" m={0}>
        {category.title}
      </Text>
      <SimpleGrid
        columns={{ base: 2, md: category.columns }}
        gap="10px"
      >
        {category.options.map((option) => (
          <SelectionCard
            key={option.id}
            icon={option.icon}
            label={option.label}
            isSelected={selectedId === option.id}
            onClick={() => onSelect(option.id)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}
