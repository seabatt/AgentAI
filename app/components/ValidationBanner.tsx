'use client';

import { AgentAIAlert } from '@agentai/appsdk';

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
    <AgentAIAlert
      status="auth"
      title="Almost there"
      description={message}
    />
  );
}
