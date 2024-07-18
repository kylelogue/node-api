"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { SERVER_URL, SERVER_PORT } = process.env;
const allowed = [`${SERVER_URL}:${SERVER_PORT}`];
const options = {
    origin: allowed
};
exports.default = options;
