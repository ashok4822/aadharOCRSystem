import { apiClient } from './client';
import type { AadhaarData } from '../types';

export interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data: T;
}

// Track any in-flight OCR request so we can cancel it before sending a new one.
// This prevents duplicate backend processing when the user retries.
let activeOcrController: AbortController | null = null;

export const aadhaarService = {
  /**
   * Fetches the history of past Aadhaar OCR results from the backend.
   */
  async getHistory(): Promise<AadhaarData[]> {
    const response = await apiClient.get<ApiResponse<AadhaarData[]>>('/history');
    if (response.data && response.data.status) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch history.');
  },

  /**
   * Sends the front and back images of the Aadhaar card to perform OCR.
   * Cancels any previous in-flight OCR request to prevent duplicate backend processing.
   */
  async performOCR(frontImage: File, backImage: File): Promise<AadhaarData> {
    // Cancel any existing in-flight request before starting a new one
    if (activeOcrController) {
      activeOcrController.abort();
    }
    activeOcrController = new AbortController();

    const formData = new FormData();
    formData.append('frontImage', frontImage);
    formData.append('backImage', backImage);

    try {
      const response = await apiClient.post<ApiResponse<AadhaarData>>('/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: activeOcrController.signal,
      });

      if (response.data && response.data.status) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'An error occurred during Aadhaar parsing.');
    } finally {
      // Clear the controller once done (success or error)
      activeOcrController = null;
    }
  }
};
