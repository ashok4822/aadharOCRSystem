export interface IOCRService {
  performOCR(file: string | Buffer): Promise<string>;
}
export default IOCRService;
