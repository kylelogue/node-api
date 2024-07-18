import { NextFunction, Request, Response } from 'express';

const { SERVER_URL, SERVER_PORT } = process.env;
const allowed = `${SERVER_URL}:${SERVER_PORT}`;

const credentials = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin === allowed) {
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    next();
};

export default credentials;