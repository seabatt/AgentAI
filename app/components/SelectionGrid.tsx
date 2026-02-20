'use client';

import { SimpleGrid } from '@chakra-ui/react';
import { AgentAISection } from '@agentai/appsdk';
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
    <AgentAISection title={category.title} accent="blue">
      <SimpleGrid
        columns={{ base: 2, md: category.columns }}
        gap={3}
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
    </AgentAISection>
  );
}
