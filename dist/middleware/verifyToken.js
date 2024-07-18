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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../db/prisma"));
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers['authorization'];
    if (!authHeader)
        return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    if (!process.env.JWT_SECRET)
        res.sendStatus(500);
    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const foundUser = yield prisma_1.default.user.findUnique({
        where: {
            email: decoded.email
        }
    });
    if (foundUser) {
        req.email = foundUser.email;
    }
    next();
});
exports.default = verifyToken;
