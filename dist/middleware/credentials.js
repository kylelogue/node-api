"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { SERVER_URL, SERVER_PORT } = process.env;
const allowed = `${SERVER_URL}:${SERVER_PORT}`;
const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (origin === allowed) {
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    next();
};
exports.default = credentials;
