import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import corsConfig from './config/cors';
import cookieParser from 'cookie-parser';
import logger from './middleware/logger';
import credentials from './middleware/credentials';

import authRoutes from './routes/auth';

const app = express();
dotenv.config();
const { SERVER_PORT, NODE_ENV } = process.env;

app.use(credentials);
app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser());

if ( NODE_ENV === 'dev' ) {
    app.use(logger);
}

// Routes
app.use('/auth', authRoutes);

// Catch all 404 route
app.get('*', (req, res) => {
    res.sendStatus(404);
});

app.listen(SERVER_PORT, () => {
    /* eslint-disable-next-line no-console */
    console.log(`Running on Port ${SERVER_PORT}`);
});