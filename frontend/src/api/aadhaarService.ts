import { apiClient } from './client';
import type { AadhaarData } from '../types';

export interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data: T;
}

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
   */
  async performOCR(frontImage: File, backImage: File): Promise<AadhaarData> {
    const formData = new FormData();
    formData.append('frontImage', frontImage);
    formData.append('backImage', backImage);

    const response = await apiClient.post<ApiResponse<AadhaarData>>('/ocr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data && response.data.status) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'An error occurred during Aadhaar parsing.');
  }
};
