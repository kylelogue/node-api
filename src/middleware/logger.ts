import { NextFunction, Request, Response } from 'express';

const logger = (req: Request, res: Response, next: NextFunction) => {
    /* eslint-disable-next-line no-console */
    console.log(req.method, req.path);
    next();
};

export default logger;