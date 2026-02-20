'use client';

import { useRef } from 'react';
import { Box, Text, Image, Flex } from '@chakra-ui/react';
import { LuX, LuUpload } from 'react-icons/lu';

interface PhotoUploadProps {
  previewUrl: string | null;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}

export function PhotoUpload({
  previewUrl,
  onFileSelect,
  onRemove,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Photo must be under 10MB. Try a smaller image.');
        return;
      }
      onFileSelect(file);
    }
  }

  if (previewUrl) {
    return (
      <Box mb={6}>
        <Box position="relative" display="inline-block" w="100%">
          <Flex justify="center">
            <Box position="relative">
              <Image
                src={previewUrl}
                alt="Your photo"
                maxH="200px"
                borderRadius="8px"
                objectFit="cover"
              />
              <Box
                as="button"
                onClick={onRemove}
                position="absolute"
                top={-2}
                right={-2}
                bg="white"
                borderRadius="full"
                w="28px"
                h="28px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="0 2px 8px rgba(0,0,0,0.15)"
                cursor="pointer"
                border="1px solid #e2e8f0"
                _hover={{ bg: '#f1f5f9' }}
              >
                <LuX size={14} />
              </Box>
            </Box>
          </Flex>
        </Box>
        <Box
          as="button"
          onClick={() => inputRef.current?.click()}
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="100%"
          mt={4}
          py={3}
          border="1px solid #e2e8f0"
          borderRadius="8px"
          bg="white"
          cursor="pointer"
          fontSize="14px"
          fontWeight="500"
          color="#334155"
          _hover={{ bg: '#f8fafc' }}
        >
          Choose different image
        </Box>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </Box>
    );
  }

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
          Upload your photo
        </Text>
        <Text fontSize="13px" color="#94a3b8" mt={1} m={0}>
          JPEG, PNG, or WebP up to 10MB
        </Text>
      </Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </Box>
  );
}
