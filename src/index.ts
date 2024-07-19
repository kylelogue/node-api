import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import corsConfig from './config/cors';
import cookieParser from 'cookie-parser';
import logger from './middleware/logger';

// Route imports
import authRoutes from './routes/auth';

// Server Initialization
const app = express();
dotenv.config();
const { SERVER_PORT, NODE_ENV } = process.env;

app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());

if ( NODE_ENV === 'dev' ) {
    app.use(logger);
}

// Route definitions
app.use('/auth', authRoutes);

// Catch-all for unregistered routes
app.all('*', (req, res) => {
    /* eslint-disable-next-line no-console */
    console.log('Unregistered route requested:',req.method, req.path);
    res.sendStatus(404);
});

app.listen(SERVER_PORT, () => {
    /* eslint-disable-next-line no-console */
    console.log(`Running on Port ${SERVER_PORT}`);
});