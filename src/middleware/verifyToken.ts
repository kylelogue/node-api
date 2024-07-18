import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import prisma from '../db/prisma';

interface IJwtPayload extends JwtPayload {
    email: string;
}
interface IRequest extends Request {
    email: string
}

const verifyToken = async (req: IRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    if(!process.env.JWT_SECRET) res.sendStatus(500);
    const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret) as IJwtPayload;
    const foundUser = await prisma.user.findUnique({
        where:{
            email: decoded.email
        }
    });
    if(foundUser) {
        req.email = foundUser.email;
    }
    next();

};

export default verifyToken;