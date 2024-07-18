"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../db/prisma"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    //TODO: input validation?
    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required.' });
    const existingUser = yield prisma_1.default.user.findUnique({
        where: {
            email
        }
    });
    if (existingUser)
        return res.status(409).json({ message: 'Email has already been registered.' });
    const passwordHash = yield bcrypt_1.default.hash(password, 10);
    const newUser = { email, password: passwordHash };
    yield prisma_1.default.user.create({
        data: Object.assign({}, newUser)
    });
    res.status(201).json({ message: 'User created.' });
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required.' });
    const foundUser = yield prisma_1.default.user.findUnique({
        where: {
            email
        }
    });
    if (!foundUser)
        return res.sendStatus(401); //Unauthorized
    // Evaluate password
    const match = yield bcrypt_1.default.compare(password, foundUser.password);
    if (match) {
        // Create JWTs
        const accessToken = jsonwebtoken_1.default.sign({ email: foundUser.email }, process.env.JWT_SECRET, { expiresIn: '30m' });
        const refreshToken = jsonwebtoken_1.default.sign({ email: foundUser.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
        // Save refreshToken with current user
        yield prisma_1.default.user.update({
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
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });
        res.json({ accessToken });
    }
    else {
        // Password incorrect
        res.sendStatus(401);
    }
});
exports.login = login;
// export const user = async (req: Request, res: Response) => {
//     const { user } = req;
//     const foundUser = await prisma.user.findUnique({
//         where: {
//             email
//         }
//     });
//     if(!foundUser) res.sendStatus(404);
//     // Sanitize
//     res.json({
//         email: foundUser.email
//     });
// };
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = req.cookies;
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
        return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    const foundUser = yield prisma_1.default.user.findFirst({
        where: {
            refreshToken
        }
    });
    if (!foundUser)
        return res.sendStatus(403); //Forbidden
    // Evaluate jwt
    const decoded = yield jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET);
    if (foundUser.email !== decoded.email)
        return res.sendStatus(403);
    const accessToken = yield jsonwebtoken_1.default.sign({ email: decoded.email }, process.env.JWT_SECRET, { expiresIn: '30m' });
    res.json({ accessToken });
});
exports.refresh = refresh;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO: On client...delete the accessToken
    const cookies = req.cookies;
    if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
        return res.sendStatus(204); //No content
    const refreshToken = cookies.jwt;
    // Is refreshToken in DB?
    const foundUser = yield prisma_1.default.user.findFirst({
        where: {
            refreshToken
        }
    });
    if (!foundUser) {
        res.clearCookie('jwt', { httpOnly: true, secure: true });
        return res.sendStatus(204);
    }
    // Delete refreshToken in DB
    yield prisma_1.default.user.update({
        where: {
            email: foundUser.email
        },
        data: {
            refreshToken: null
        }
    });
    res.clearCookie('jwt', { httpOnly: true });
    res.sendStatus(204);
});
exports.logout = logout;
