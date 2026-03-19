import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import podcastsRouter from './src/routes/podcasts';
import episodesRouter from './src/routes/episodes';





const app = express();



app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));


app.use('/api/v1/podcasts', podcastsRouter);
app.use('/api/v1/episodes', episodesRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'podcast' });
});


app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});


export default app;