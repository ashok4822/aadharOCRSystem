import { createWorker } from 'tesseract.js';
import { IOCRService } from '../../application/services/IOCRService';
import { ServerMessages } from '../../config/messages';

export class TesseractOCRService implements IOCRService {
  public async performOCR(file: string | Buffer): Promise<string> {
    try {
      console.log(`Starting OCR on ${Buffer.isBuffer(file) ? 'Buffer' : 'file: ' + file}`);
      // Use 'eng+mal' so Malayalam characters are output as proper Unicode
      // (U+0D00-U+0D7F) rather than being misread as garbled ASCII.
      // This allows the parser to reliably filter Malayalam lines and keep
      // only English content for name, gender, and address extraction.
      const worker = await createWorker('eng+mal');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();
      return text;
    } catch (error) {
      console.error(`OCR failed for ${Buffer.isBuffer(file) ? 'Buffer' : file}`, error);
      throw new Error(ServerMessages.ERROR.OCR_PROCESSING_FAILED((error as Error).message));
    }
  }
}
