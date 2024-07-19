import { register, login, refresh, logout } from './auth.controller';
import { Request, Response } from 'express';
import { prismaMock as prisma } from '../db/mock';
import { User } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

describe('Auth controller', () => {
    let req: Request;
    let res: Response;

    beforeEach( () => {
        req = {
            body: {}
        } as Request;
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            sendStatus: jest.fn(),
            cookie: jest.fn(),
            clearCookie: jest.fn()
        } as unknown as Response;
    });

    describe('register', () => {
        it('returns a 400 if no email or password are provided', async () => {
            await register(req,res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required.' });
        });

        it('returns a 409 if the email is already registered', async () => {
            req.body = {
                email: 'test@test.com',
                password: 'password'
            };
            const user = {
                email: 'test@test.com'
            } as User;

            prisma.user.findUnique.mockResolvedValue(user);

            await register(req, res);
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: 'Email has already been registered.' });
        });

        it('returns a 201 if a new user is created ', async () => {
            req.body = {
                email: 'test@test.com',
                password: 'password'
            };
            const user = {
                email: 'test@test.com'
            } as User;

            prisma.user.findUnique.mockResolvedValue(null);
            prisma.user.create.mockResolvedValue(user);

            await register(req, res);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: 'test@test.com',
                    password: expect.any(String)
                }
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: 'User created.' });
        });
    });

    describe('login', () => {
        it('returns a 400 if email and password are not provided', async () => {
            await login(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Email and password are required.' });
        });

        it('returns a 401 if user is not found',async () => {
            req.body = {
                email: 'test@test.com',
                password: 'password'
            };
            prisma.user.findUnique.mockResolvedValue(null);

            await login(req, res);
            expect(res.sendStatus).toHaveBeenCalledWith(401);
        });

        it('returns an access token if successfully logged in', async () => {
            req.body = {
                email: 'test@test.com',
                password: 'password'
            };
            const user = {
                email: 'test@test.com',
                password: '$2b$10$ZX7hpAtiMeCrQHbvnqtC9.DsLwCVkbDCFkavudBJG/sV0HxkhghcW' // password
            } as User;

            prisma.user.findUnique.mockResolvedValue(user);

            await login(req, res);
            expect(res.cookie).toHaveBeenCalledWith('jwt', expect.any(String), { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
            expect(res.json).toHaveBeenCalledWith({ accessToken: expect.any(String) });
        });
    });

    describe('refresh', () => {
        it('returns a 401 if jwt cookie has not been set', async () => {
            await refresh(req, res);
            expect(res.sendStatus).toHaveBeenCalledWith(401);
        });

        it('returns a 403 if user with refresh token does not exist', async () => {
            req.cookies = {
                jwt: 'test-token'
            };

            prisma.user.findFirst.mockResolvedValue(null);

            await refresh(req, res);
            expect(res.sendStatus).toHaveBeenCalledWith(403);
        });

        it('returns a 403 if refresh token and user dont match', async () => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE3MjE0MTE3OTl9.oSui0xIslzVhE_LbEd7v2ltYd47WQvrWSqEZhi1gkCo';
            req.cookies = {
                jwt: token
            };

            const user = {
                email: 'wrong@test.com'
            } as User;

            prisma.user.findFirst.mockResolvedValue(user);

            await refresh(req, res);
            expect(res.sendStatus).toHaveBeenLastCalledWith(403);
        });

        it('returns a valid access token when provided with a valid refresh token', async () => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJpYXQiOjE3MjE0MTE3OTl9.oSui0xIslzVhE_LbEd7v2ltYd47WQvrWSqEZhi1gkCo';
            req.cookies = {
                jwt: token
            };

            const user = {
                email: 'test@test.com',
                refreshToken: token
            } as User;

            prisma.user.findFirst.mockResolvedValue(user);

            await refresh(req, res);
            expect(res.json).toHaveBeenCalledWith({ accessToken: expect.any(String) });
        });
    });

    describe('logout', () => {
        it('returns a 204 if a jwt cookie has not been set', async () => {
            await logout(req, res);
            expect(res.sendStatus).toHaveBeenCalledWith(204);
        });

        it('clears the jwt cookie if a user is not found', async () => {
            req.cookies = {
                jwt: 'test-token'
            };

            prisma.user.findFirst.mockResolvedValue(null);

            await logout(req, res);
            expect(res.clearCookie).toHaveBeenCalledWith('jwt');
            expect(res.sendStatus).toHaveBeenCalledWith(204);
        });

        it('clears the jwt cookie and sets user refreshToken to null if user exists', async () => {
            req.cookies = {
                jwt: 'test-token'
            };
            const user = {
                email: 'test@test.com',
                refreshToken: 'test-token'
            } as User;

            prisma.user.findFirst.mockResolvedValue(user);

            await logout(req, res);
            expect(prisma.user.update).toHaveBeenLastCalledWith({
                where: {
                    email: 'test@test.com'
                },
                data: {
                    refreshToken: null
                }
            });
            expect(res.clearCookie).toHaveBeenCalledWith('jwt');
            expect(res.sendStatus).toHaveBeenCalledWith(204);
        });
    });
});