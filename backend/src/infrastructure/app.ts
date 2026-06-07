import express from 'express';
import cors from 'cors';
import path from 'path';

export const createApp = (): express.Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const uploadDir = path.resolve(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadDir));

  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', time: new Date() });
  });

  return app;
};
