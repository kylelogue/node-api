
import bcrypt from 'bcrypt';
import { default as jwt, Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';
import prisma from '../db/client';

interface IJwtPayload extends JwtPayload {
    email: string
}

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    // TODO: input validation?
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });
    if(existingUser) return res.status(409).json({ message: 'Email has already been registered.' });
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { email, password: passwordHash };
    await prisma.user.create({
        data: newUser
    });
    res.status(201).json({ message: 'User created.' });
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
    const foundUser = await prisma.user.findUnique({
        where: { email }
    });
    // Unauthorized
    if (!foundUser) return res.sendStatus(401);
    // Evaluate password
    const match = await bcrypt.compare(password, foundUser.password);
    if (match) {
        // Create JWTs
        const accessToken = jwt.sign(
            { email: foundUser.email },
            process.env.JWT_SECRET as Secret,
            { expiresIn: '30m' }
        );
        const refreshToken = jwt.sign(
            { email: foundUser.email },
            process.env.JWT_SECRET as Secret,
            { expiresIn: '1d' }
        );
        // Save refreshToken to DB
        await prisma.user.update({
            where: {
                email
            },
            data: {
                refreshToken
            }
        });
        res.cookie('jwt', refreshToken, {
            httpOnly: true,
            // sameSite: 'None',
            // secure: true,
            maxAge: 24 * 60 * 60 * 1000  // 1 day
        });
        res.json({ accessToken });
    } else {
        // Password is wrong
        res.sendStatus(401);
    }
};

export const refresh = async (req: Request, res: Response) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;

    const foundUser = await prisma.user.findFirst({
        where: {
            refreshToken
        }
    });
    // Forbidden
    if (!foundUser) return res.sendStatus(403);
    // Evaluate jwt
    const decoded = await jwt.verify(
        refreshToken,
        process.env.JWT_SECRET as Secret,
    ) as IJwtPayload;
    if (foundUser.email !== decoded.email) return res.sendStatus(403);
    const accessToken = await jwt.sign(
        { email: decoded.email },
        process.env.JWT_SECRET as Secret,
        { expiresIn: '30m' }
    );
    res.json({ accessToken });
};

export const logout = async (req: Request, res: Response) => {

    // TODO: On client...delete the accessToken
    const cookies = req.cookies;
    // No content
    if (!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;

    // Is refreshToken in DB?
    const foundUser = await prisma.user.findFirst({
        where: {
            refreshToken
        }
    });
    if (!foundUser) {
        res.clearCookie('jwt');
        return res.sendStatus(204);
    }

    // Delete refreshToken in DB
    await prisma.user.update({
        where: {
            email: foundUser.email
        },
        data: {
            refreshToken: null
        }
    });

    res.clearCookie('jwt');
    res.sendStatus(204);
};