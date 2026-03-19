import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import podcastsRouter from './src/routes/podcasts';
import episodedRouter from './src/routes/episodes';
import multer from 'multer';




const app = express();



app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));


app.use('/api/v1/podcasts', podcastsRouter);
app.use('/api/v1/episodes', episodedRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'podcast' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof multer.MulterError) {
        res.status(400).json({ error: err.message, code: err.code });
        return;
    }

    if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({ error: 'Invalid JSON', code: 'PARSE_ERROR' });
        return;
    }

    console.error('[Global error handler]', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});


export default app;