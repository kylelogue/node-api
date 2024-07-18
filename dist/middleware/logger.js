"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = (req, res, next) => {
    /* eslint-disable-next-line no-console */
    console.log(req.method, req.path);
    next();
};
exports.default = logger;
