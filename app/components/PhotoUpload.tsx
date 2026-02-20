'use client';

import { useRef } from 'react';
import { Box, Text, Image, Flex } from '@chakra-ui/react';
import { AgentAIButton } from '@agentai/appsdk';
import { LuX, LuUpload, LuPlus } from 'react-icons/lu';

const MAX_PHOTOS = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface PhotoUploadProps {
  photos: { file: File; previewUrl: string }[];
  onAddPhotos: (files: File[]) => void;
  onRemove: (index: number) => void;
}

export function PhotoUpload({
  photos,
  onAddPhotos,
  onRemove,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const remaining = MAX_PHOTOS - photos.length;
    const incoming = Array.from(fileList).slice(0, remaining);

    const valid: File[] = [];
    for (const file of incoming) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`"${file.name}" is over 10 MB and was skipped.`);
        continue;
      }
      valid.push(file);
    }

    if (valid.length > 0) onAddPhotos(valid);
    if (inputRef.current) inputRef.current.value = '';
  }

  const spotsLeft = MAX_PHOTOS - photos.length;

  if (photos.length === 0) {
    return (
      <Box mb={6}>
        <Box
          as="button"
          onClick={() => inputRef.current?.click()}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          w="100%"
          py={12}
          border="2px dashed #cbd5e0"
          borderRadius="12px"
          bg="#f8fafc"
          cursor="pointer"
          transition="all 0.15s ease"
          _hover={{ borderColor: '#94a3b8', bg: '#f1f5f9' }}
        >
          <Box color="#94a3b8" mb={3}>
            <LuUpload size={32} />
          </Box>
          <Text fontSize="15px" fontWeight="600" color="#334155" m={0}>
            Upload up to {MAX_PHOTOS} photos
          </Text>
          <Text fontSize="13px" color="#94a3b8" mt={1} m={0}>
            More angles = better results. JPEG, PNG, or WebP up to 10 MB each.
          </Text>
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </Box>
    );
  }

  return (
    <Box mb={6}>
      <Flex gap={3} flexWrap="wrap">
        {photos.map((p, i) => (
          <Box key={i} position="relative" flexShrink={0}>
            <Image
              src={p.previewUrl}
              alt={`Photo ${i + 1}`}
              w="120px"
              h="120px"
              borderRadius="10px"
              objectFit="cover"
              border="2px solid #e2e8f0"
            />
            <Box
              as="button"
              onClick={() => onRemove(i)}
              position="absolute"
              top={-2}
              right={-2}
              bg="white"
              borderRadius="full"
              w="24px"
              h="24px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 2px 8px rgba(0,0,0,0.15)"
              cursor="pointer"
              border="1px solid #e2e8f0"
              _hover={{ bg: '#f1f5f9' }}
            >
              <LuX size={12} />
            </Box>
          </Box>
        ))}

        {spotsLeft > 0 && (
          <Box
            as="button"
            onClick={() => inputRef.current?.click()}
            w="120px"
            h="120px"
            borderRadius="10px"
            border="2px dashed #cbd5e0"
            bg="#f8fafc"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            transition="all 0.15s ease"
            _hover={{ borderColor: '#94a3b8', bg: '#f1f5f9' }}
          >
            <Box color="#94a3b8" mb={1}>
              <LuPlus size={20} />
            </Box>
            <Text fontSize="11px" color="#94a3b8" m={0}>
              Add photo
            </Text>
          </Box>
        )}
      </Flex>

      <Text fontSize="12px" color="#94a3b8" mt={2} m={0}>
        {photos.length} of {MAX_PHOTOS} photos &mdash; more angles help with likeness
      </Text>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </Box>
  );
}
