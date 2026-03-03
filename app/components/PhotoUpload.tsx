'use client';

import { useRef } from 'react';
import { Box, Text, Image, Flex } from '@chakra-ui/react';
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
      <Box>
        <Text fontSize="13px" fontWeight="600" color="#0a1b22" mb="8px" m={0}>
          Upload your photos
        </Text>
        <Box
          as="button"
          onClick={() => inputRef.current?.click()}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          w="100%"
          py="40px"
          border="2px dashed #e8e6e2"
          borderRadius="12px"
          bg="#f9f8f6"
          cursor="pointer"
          transition="all 0.15s ease"
          _hover={{ borderColor: '#c4c2be', bg: '#f4f2ee' }}
        >
          <Box color="#94928e" mb="8px">
            <LuUpload size={28} />
          </Box>
          <Text fontSize="14px" fontWeight="600" color="#0a1b22" m={0}>
            Upload up to {MAX_PHOTOS} photos
          </Text>
          <Text fontSize="13px" color="#94928e" mt="4px" m={0}>
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
    <Box>
      <Text fontSize="13px" fontWeight="600" color="#0a1b22" mb="8px" m={0}>
        Your photos
      </Text>
      <Flex gap="10px" flexWrap="wrap">
        {photos.map((p, i) => (
          <Box key={i} position="relative" flexShrink={0}>
            <Image
              src={p.previewUrl}
              alt={`Photo ${i + 1}`}
              w="100px"
              h="100px"
              borderRadius="12px"
              objectFit="cover"
              border="2px solid #e8e6e2"
            />
            <Box
              as="button"
              onClick={() => onRemove(i)}
              position="absolute"
              top="-6px"
              right="-6px"
              bg="white"
              borderRadius="full"
              w="22px"
              h="22px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="0 2px 8px rgba(0,0,0,0.15)"
              cursor="pointer"
              border="1px solid #e8e6e2"
              _hover={{ bg: '#f4f2ee' }}
              transition="all 0.15s ease"
            >
              <LuX size={11} />
            </Box>
          </Box>
        ))}

        {spotsLeft > 0 && (
          <Box
            as="button"
            onClick={() => inputRef.current?.click()}
            w="100px"
            h="100px"
            borderRadius="12px"
            border="2px dashed #e8e6e2"
            bg="#f9f8f6"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            cursor="pointer"
            transition="all 0.15s ease"
            _hover={{ borderColor: '#c4c2be', bg: '#f4f2ee' }}
          >
            <Box color="#94928e" mb="2px">
              <LuPlus size={18} />
            </Box>
            <Text fontSize="11px" color="#94928e" m={0}>
              Add photo
            </Text>
          </Box>
        )}
      </Flex>

      <Text fontSize="12px" color="#94928e" mt="6px" m={0}>
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
