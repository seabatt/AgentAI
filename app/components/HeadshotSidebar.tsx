'use client';

import { VStack, Box, Text, HStack } from '@chakra-ui/react';
import { LuClock, LuCamera, LuSparkles, LuTrash2 } from 'react-icons/lu';
import type { HeadshotSession } from '@/lib/session-store';

interface HeadshotSidebarProps {
  sessions: HeadshotSession[];
  activeSessionId: string | null;
  onViewSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onNewSession: () => void;
}

function formatShortDate(isoStr: string): string {
  if (!isoStr) return '';
  try {
    const date = new Date(isoStr);
    const datePart = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const timePart = date
      .toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
      .replace(' ', '');
    return `${datePart} ${timePart}`;
  } catch {
    return '';
  }
}

export function HeadshotSidebar({
  sessions,
  activeSessionId,
  onViewSession,
  onDeleteSession,
  onNewSession,
}: HeadshotSidebarProps) {
  return (
    <VStack
      align="stretch"
      gap="0"
      h="100vh"
      w="260px"
      flexShrink={0}
      bg="#faf9f7"
      borderRight="1px solid #e8e6e2"
      overflow="hidden"
      position="sticky"
      top={0}
    >
      {/* Agent header */}
      <Box px="20px" pt="20px" pb="16px">
        <HStack gap="10px" align="start">
          <Box
            w="36px"
            h="36px"
            borderRadius="10px"
            bg="#eff6ff"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <LuCamera size={18} color="#0777e6" />
          </Box>
          <VStack align="start" gap="2px">
            <Text fontSize="14px" fontWeight="700" color="#0a1b22" m={0} lineHeight="1.3">
              AI Headshot Generator
            </Text>
            <Text fontSize="12px" color="#94928e" m={0} lineHeight="1.4">
              Upload selfies. Pick a style. Get headshots.
            </Text>
          </VStack>
        </HStack>
      </Box>

      {/* Action links */}
      <VStack align="stretch" gap="0" px="12px" pb="12px">
        <Box
          as="button"
          display="flex"
          alignItems="center"
          gap="10px"
          w="full"
          py="10px"
          px="10px"
          bg="transparent"
          border="none"
          borderRadius="8px"
          cursor="pointer"
          transition="background 0.1s"
          _hover={{ bg: '#f0eae2' }}
          onClick={onNewSession}
          textAlign="left"
        >
          <LuSparkles size={16} color="#0a1b22" />
          <Text fontSize="14px" fontWeight="500" color="#0a1b22" m={0}>
            New Headshot
          </Text>
        </Box>
      </VStack>

      {/* History tab header */}
      <Box px="12px" pb="4px">
        <Box
          display="inline-flex"
          alignItems="center"
          gap="6px"
          bg="#eae7e1"
          borderRadius="8px"
          px="12px"
          py="6px"
        >
          <LuClock size={12} color="#64625e" />
          <Text fontSize="12px" fontWeight="600" color="#64625e" m={0}>
            History
          </Text>
          {sessions.length > 0 && (
            <Box
              bg="white"
              borderRadius="full"
              px="6px"
              py="1px"
              fontSize="11px"
              fontWeight="600"
              color="#64625e"
              lineHeight="14px"
            >
              {sessions.length}
            </Box>
          )}
        </Box>
      </Box>

      {/* Session list */}
      <Box
        flex="1"
        overflowY="auto"
        px="8px"
        pt="4px"
        css={{
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: '#D1C7B8',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': { background: '#B5A99A' },
        }}
      >
        {sessions.length === 0 ? (
          <Box px="12px" py="24px">
            <Text fontSize="13px" color="#94928e" textAlign="center" m={0}>
              No headshots yet.
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" gap="2px">
            {sessions.map((session) => {
              const dateStr = formatShortDate(session.createdAt);
              const isActive = session.id === activeSessionId;

              return (
                <Box
                  key={session.id}
                  as="button"
                  w="full"
                  py="10px"
                  px="12px"
                  bg={isActive ? '#f0eae2' : 'transparent'}
                  borderRadius="8px"
                  cursor="pointer"
                  textAlign="left"
                  transition="background 0.1s"
                  _hover={{ bg: '#F0EAE2' }}
                  onClick={() => onViewSession(session.id)}
                  border="none"
                  display="flex"
                  alignItems="center"
                  gap="10px"
                  position="relative"
                  role="group"
                >
                  {/* Left indicator dot */}
                  <Box
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg={isActive ? '#0777e6' : '#c9c4bd'}
                    flexShrink={0}
                  />

                  {/* Info */}
                  <VStack align="start" gap="2px" flex="1" overflow="hidden">
                    <Text
                      fontSize="13px"
                      fontWeight="500"
                      color="#0a1b22"
                      m={0}
                      lineHeight="1.3"
                      truncate
                      w="full"
                    >
                      {session.styleName}
                    </Text>
                    <Text
                      fontSize="11px"
                      color="#94928e"
                      m={0}
                      whiteSpace="nowrap"
                    >
                      {dateStr}
                    </Text>
                  </VStack>

                  {/* Delete button (visible on hover) */}
                  <Box
                    position="absolute"
                    right="8px"
                    top="50%"
                    transform="translateY(-50%)"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.15s ease"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    w="22px"
                    h="22px"
                    borderRadius="5px"
                    bg="white"
                    border="1px solid #e8e6e2"
                    cursor="pointer"
                    _hover={{ bg: '#fef2f2', borderColor: '#fecaca' }}
                  >
                    <LuTrash2 size={11} color="#94928e" />
                  </Box>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>

      {/* Footer */}
      <Box px="16px" py="12px" borderTop="1px solid #f0eae2">
        <Text fontSize="11px" color="#c9c4bd" m={0}>
          Made with Agent.ai
        </Text>
      </Box>
    </VStack>
  );
}
