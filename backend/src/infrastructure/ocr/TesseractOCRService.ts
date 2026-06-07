import { createWorker } from 'tesseract.js';
import { IOCRService } from '../../application/services/IOCRService';

export class TesseractOCRService implements IOCRService {
  public async performOCR(filePath: string): Promise<string> {
    try {
      console.log(`Starting OCR on file: ${filePath}`);
      // createWorker initializes with the desired language
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(filePath);
      await worker.terminate();
      return text;
    } catch (error) {
      console.error(`OCR failed for file: ${filePath}`, error);
      throw new Error(`OCR Processing failed: ${(error as Error).message}`);
    }
  }
}
