import { Request, Response } from 'express';
import { ProcessAadhaarOCR } from '../../application/usecases/ProcessAadhaarOCR';
import { GetAadhaarHistory } from '../../application/usecases/GetAadhaarHistory';
import { AadhaarMapper } from '../../application/mappers/AadhaarMapper';

export class AadhaarController {
  constructor(
    private readonly processOCRUseCase: ProcessAadhaarOCR,
    private readonly getHistoryUseCase: GetAadhaarHistory
  ) {}

  public uploadAndProcess = async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files || !files['frontImage'] || !files['backImage']) {
        res.status(400).json({
          status: false,
          message: 'Both frontImage and backImage files are required.',
        });
        return;
      }

      const frontFile = files['frontImage'][0];
      const backFile = files['backImage'][0];

      // Call the usecase with path for OCR and filename for DB storage
      const aadhaar = await this.processOCRUseCase.execute(
        frontFile.path,
        backFile.path,
        frontFile.filename,
        backFile.filename
      );
      const dto = AadhaarMapper.toDTO(aadhaar);

      res.status(200).json({
        status: true,
        message: 'Parsing Successful',
        data: dto,
      });
    } catch (error) {
      console.error('Controller processing error:', error);
      res.status(500).json({
        status: false,
        message: 'Internal Server Error during OCR processing.',
        error: (error as Error).message,
      });
    }
  };

  public getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const history = await this.getHistoryUseCase.execute();
      const dtos = history.map(item => AadhaarMapper.toDTO(item));

      res.status(200).json({
        status: true,
        message: 'Fetched history successfully',
        data: dtos,
      });
    } catch (error) {
      console.error('Controller history error:', error);
      res.status(500).json({
        status: false,
        message: 'Internal Server Error during history retrieval.',
        error: (error as Error).message,
      });
    }
  };
}
