import express from 'express';
import cors from 'cors';
import { HttpStatus } from '../config/httpStatus';

export const createApp = (): express.Application => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req, res) => {
    res.status(HttpStatus.OK).json({ status: 'healthy', time: new Date() });
  });

  return app;
};
