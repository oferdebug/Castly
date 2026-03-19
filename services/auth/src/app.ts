/**
 * Auth Service — Express Application
 *
 * Configures and exports the Express app instance for the auth microservice.
 *
 * Architecture Overview:
 * - Single entry point for all middleware registration and route mounting
 * - Separated from server bootstrap (index.ts) for testability
 * - All auth routes are scoped under the /auth prefix
 *
 * Middleware Stack:
 * - helmet: Sets secure HTTP response headers
 * - cors: Allows cross-origin requests from the API gateway
 * - express.json: Parses incoming JSON request bodies
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRouter from './routes/auth';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth' });
});

app.use('/auth', authRouter);

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

export default app;
