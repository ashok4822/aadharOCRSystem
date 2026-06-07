export interface IOCRService {
  performOCR(filePath: string): Promise<string>;
}
export default IOCRService;
