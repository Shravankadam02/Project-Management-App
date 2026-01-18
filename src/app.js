import express from 'express';
import cors from 'cors';
import { healthcheck } from './controllers/healthcheck.controller.js';
import cookieParser from 'cookie-parser';
const app = express();

//Basic Configurations
app.use(express.json({ limit: '16kb' }));

app.use(express.urlencoded({ extended: true , limit: '16kb' }));

app.use(express.static("public"));

app.use(cookieParser());

//CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

//import test routes
import healthcheckRouter from './routes/healthcheck.routes.js';

import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';

app.use('/api/v1/auth',authRouter);

app.use('/api/v1/healthcheck',healthcheckRouter);

app.use('/api/v1/projects',projectRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

export default app;