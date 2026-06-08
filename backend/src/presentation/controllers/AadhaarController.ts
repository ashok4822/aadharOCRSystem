import { Request, Response, NextFunction } from 'express';
import { IProcessAadhaarOCR } from '../../application/usecases/IProcessAadhaarOCR';
import { IGetAadhaarHistory } from '../../application/usecases/IGetAadhaarHistory';
import { AadhaarMapper } from '../../application/mappers/AadhaarMapper';
import { AppError } from '../../infrastructure/errors/AppError';
import { HttpStatus } from '../../config/httpStatus';
import { ServerMessages } from '../../config/messages';

export class AadhaarController {
  constructor(
    private readonly processOCRUseCase: IProcessAadhaarOCR,
    private readonly getHistoryUseCase: IGetAadhaarHistory
  ) {}

  public uploadAndProcess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files || !files['frontImage'] || !files['backImage']) {
        throw new AppError(ServerMessages.ERROR.FILES_REQUIRED, HttpStatus.BAD_REQUEST);
      }

      const frontFile = files['frontImage'][0];
      const backFile = files['backImage'][0];

      // Call the usecase with buffer for OCR and mimetype for DB storage as Base64
      const aadhaar = await this.processOCRUseCase.execute(
        frontFile.buffer,
        backFile.buffer,
        frontFile.mimetype,
        backFile.mimetype
      );
      const dto = AadhaarMapper.toDTO(aadhaar);

      res.status(HttpStatus.OK).json({
        status: true,
        message: ServerMessages.SUCCESS.PARSING_SUCCESSFUL,
        data: dto,
      });
    } catch (error) {
      next(error);
    }
  };

  public getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const history = await this.getHistoryUseCase.execute();
      const dtos = history.map(item => AadhaarMapper.toDTO(item));

      res.status(HttpStatus.OK).json({
        status: true,
        message: ServerMessages.SUCCESS.FETCHED_HISTORY,
        data: dtos,
      });
    } catch (error) {
      next(error);
    }
  };
}

