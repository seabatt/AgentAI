'use client';

import { Box, Text, SimpleGrid } from '@chakra-ui/react';
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
    <Box mb={6}>
      <Text
        fontSize="16px"
        fontWeight="700"
        color="#0f172a"
        textAlign="center"
        mb={4}
        m={0}
        pb={4}
      >
        {category.title}
      </Text>
      <SimpleGrid
        columns={{ base: 2, md: category.columns }}
        spacing={3}
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
