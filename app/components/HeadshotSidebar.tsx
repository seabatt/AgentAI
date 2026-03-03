'use client';

import { VStack, Box, Text, HStack, Image } from '@chakra-ui/react';
import { LuClock, LuCamera, LuTrash2 } from 'react-icons/lu';
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
      w="280px"
      flexShrink={0}
      bg="white"
      borderRight="1px solid #e2e0dc"
      overflow="hidden"
      position="sticky"
      top={0}
    >
      {/* Header */}
      <HStack
        justify="space-between"
        px="16px"
        py="12px"
        borderBottom="1px solid #e2e0dc"
      >
        <HStack gap="6px">
          <LuClock size={14} color="#94928e" />
          <Text
            fontSize="11px"
            fontWeight="600"
            color="#94928e"
            letterSpacing="0.5px"
            textTransform="uppercase"
            m={0}
          >
            History
          </Text>
        </HStack>
        {sessions.length > 0 && (
          <Box
            bg="#f4f2ee"
            borderRadius="full"
            px="8px"
            py="2px"
            fontSize="11px"
            fontWeight="600"
            color="#94928e"
          >
            {sessions.length}
          </Box>
        )}
      </HStack>

      {/* New headshot button */}
      <Box px="12px" py="10px" borderBottom="1px solid #f0eae2">
        <Box
          as="button"
          w="full"
          py="10px"
          px="14px"
          bg="#0777e6"
          color="white"
          borderRadius="10px"
          border="none"
          cursor="pointer"
          fontSize="13px"
          fontWeight="600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap="6px"
          transition="all 0.15s ease"
          _hover={{ bg: '#0660b9' }}
          onClick={onNewSession}
        >
          <LuCamera size={14} />
          New Headshot
        </Box>
      </Box>

      {/* Session list */}
      <Box
        flex="1"
        overflowY="auto"
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
          <Box px="16px" py="24px">
            <Text fontSize="13px" color="#94928e" textAlign="center" m={0}>
              No headshots yet.
            </Text>
          </Box>
        ) : (
          <VStack align="stretch" gap="0" py="4px">
            {sessions.map((session) => {
              const dateStr = formatShortDate(session.createdAt);
              const isActive = session.id === activeSessionId;

              return (
                <Box
                  key={session.id}
                  as="button"
                  w="full"
                  mb="2px"
                  py="10px"
                  px="12px"
                  bg={isActive ? '#f4f2ee' : 'transparent'}
                  borderRadius="8px"
                  cursor="pointer"
                  textAlign="left"
                  transition="background 0.1s"
                  _hover={{ bg: '#F4F2EE' }}
                  onClick={() => onViewSession(session.id)}
                  border="none"
                  display="flex"
                  alignItems="center"
                  gap="10px"
                  position="relative"
                  role="group"
                >
                  {/* Thumbnail */}
                  {session.thumbnails[0] ? (
                    <Image
                      src={session.thumbnails[0]}
                      alt=""
                      w="36px"
                      h="36px"
                      borderRadius="8px"
                      objectFit="cover"
                      flexShrink={0}
                      border="1px solid #e8e6e2"
                    />
                  ) : (
                    <Box
                      w="36px"
                      h="36px"
                      borderRadius="8px"
                      bg="#f4f2ee"
                      flexShrink={0}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <LuCamera size={14} color="#94928e" />
                    </Box>
                  )}

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
                    <HStack gap="6px">
                      {dateStr && (
                        <Text
                          fontSize="11px"
                          color="#94928e"
                          m={0}
                          whiteSpace="nowrap"
                        >
                          {dateStr}
                        </Text>
                      )}
                      <Text fontSize="11px" color="#94928e" m={0}>
                        {session.imageCount} {session.imageCount === 1 ? 'image' : 'images'}
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Delete button (visible on hover) */}
                  <Box
                    position="absolute"
                    right="10px"
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
                    w="24px"
                    h="24px"
                    borderRadius="6px"
                    bg="white"
                    border="1px solid #e8e6e2"
                    cursor="pointer"
                    _hover={{ bg: '#fef2f2', borderColor: '#fecaca' }}
                  >
                    <LuTrash2 size={12} color="#94928e" />
                  </Box>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>
    </VStack>
  );
}
