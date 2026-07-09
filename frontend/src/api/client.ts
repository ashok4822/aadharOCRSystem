import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { NetworkError, ApiError, ApiValidationError } from './errors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/aadhaar';

// Create a configured axios instance
// NOTE: OCR processing (Tesseract + Groq) on Render can take 30-60s on cold starts.
// Timeout is set to 120s to prevent false NetworkError failures that cause duplicate retries.
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
});

// Request Interceptor: Attach authentication tokens or dynamic headers here in the future
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Example placeholder: Inject token if it exists in local storage
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized error/response formatting
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with non-2xx status code
      const statusCode = error.response.status;
      const responseData = error.response.data as { message?: string; error?: string; errors?: Record<string, string[]> };
      const errorMessage = responseData.message || responseData.error || `Request failed with status ${statusCode}`;
      
      if (statusCode === 400) {
        return Promise.reject(new ApiValidationError(errorMessage, responseData.errors));
      }
      return Promise.reject(new ApiError(errorMessage, statusCode));
    } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      // Request timed out — OCR processing takes longer than expected
      return Promise.reject(new NetworkError(
        'The request timed out. OCR processing is taking longer than expected. Please wait a moment and try again.'
      ));
    } else if (error.request) {
      // Request made but no response received (network error / backend down)
      return Promise.reject(new NetworkError());
    } else {
      // Request configuration issue
      return Promise.reject(error);
    }
  }
);
