import { config } from './src/config/config';
import { createApp } from './src/infrastructure/app';
import { connectDB } from './src/infrastructure/config/database';
import { TesseractOCRService } from './src/infrastructure/ocr/TesseractOCRService';
import { MongooseAadhaarRepository } from './src/infrastructure/database/repositories/MongooseAadhaarRepository';
import { GroqParserService } from './src/infrastructure/parser/GroqParserService';
import { ProcessAadhaarOCR } from './src/application/usecases/ProcessAadhaarOCR';
import { GetAadhaarHistory } from './src/application/usecases/GetAadhaarHistory';
import { AadhaarController } from './src/presentation/controllers/AadhaarController';
import { createAadhaarRouter } from './src/presentation/routes/AadhaarRoutes';
import { errorHandler } from './src/infrastructure/middleware/errorHandler';

// All environment variables are loaded and validated via src/config/config.ts

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Initialize Express App
  const app = createApp();

  // Dependency Injection setup
  const ocrService = new TesseractOCRService();
  const repository = new MongooseAadhaarRepository();
  const parserService = new GroqParserService();

  const processOCRUseCase = new ProcessAadhaarOCR(ocrService, repository, parserService);
  const getHistoryUseCase = new GetAadhaarHistory(repository);

  const controller = new AadhaarController(processOCRUseCase, getHistoryUseCase);
  const router = createAadhaarRouter(controller);

  // Hook up routes
  app.use('/api/aadhaar', router);

  // Global Error Handler Middleware
  app.use(errorHandler);

  // Start HTTP Listener
  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
};

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});

