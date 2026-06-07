import dotenv from 'dotenv';
import { createApp } from './src/infrastructure/app';
import { connectDB } from './src/infrastructure/config/database';
import { TesseractOCRService } from './src/infrastructure/ocr/TesseractOCRService';
import { MongooseAadhaarRepository } from './src/infrastructure/database/repositories/MongooseAadhaarRepository';
import { ProcessAadhaarOCR } from './src/application/usecases/ProcessAadhaarOCR';
import { GetAadhaarHistory } from './src/application/usecases/GetAadhaarHistory';
import { AadhaarController } from './src/presentation/controllers/AadhaarController';
import { createAadhaarRouter } from './src/presentation/routes/AadhaarRoutes';

// Load Environment Variables
dotenv.config();

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/aadhaar-ocr';

const startServer = async () => {
  // Connect to Database
  await connectDB(mongoUri);

  // Initialize Express App
  const app = createApp();

  // Dependency Injection setup
  const ocrService = new TesseractOCRService();
  const repository = new MongooseAadhaarRepository();

  const processOCRUseCase = new ProcessAadhaarOCR(ocrService, repository);
  const getHistoryUseCase = new GetAadhaarHistory(repository);

  const controller = new AadhaarController(processOCRUseCase, getHistoryUseCase);
  const router = createAadhaarRouter(controller);

  // Hook up routes
  app.use('/api/aadhaar', router);

  // Start HTTP Listener
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
