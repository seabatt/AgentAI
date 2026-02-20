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
    <AgentAIAlert
      status="auth"
      title="Almost there"
      description={message}
    />
  );
}
