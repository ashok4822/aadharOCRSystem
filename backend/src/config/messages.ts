/**
 * Centralized Server Messages
 * All success and error messages returned by the server are defined here.
 * Never hardcode message strings elsewhere — always import from this file.
 */
export const ServerMessages = {
  SUCCESS: {
    PARSING_SUCCESSFUL: 'Parsing Successful',
    FETCHED_HISTORY: 'Fetched history successfully',
  },
  ERROR: {
    FILES_REQUIRED: 'Both frontImage and backImage files are required.',
    ONLY_IMAGES_ALLOWED: 'Only image files (jpg, jpeg, png, webp) are allowed!',
    INTERNAL_SERVER_ERROR: 'Internal Server Error',
    FILE_SIZE_LIMIT_EXCEEDED: (maxSizeMb: number) => `File size limit exceeded. Max allowed size is ${maxSizeMb}MB per image.`,
    OCR_PROCESSING_FAILED: (detail: string) => `OCR Processing failed: ${detail}`,
  },
} as const;
