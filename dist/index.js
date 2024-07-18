"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cors_2 = __importDefault(require("./config/cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger_1 = __importDefault(require("./middleware/logger"));
const credentials_1 = __importDefault(require("./middleware/credentials"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
dotenv_1.default.config();
const { SERVER_PORT, NODE_ENV } = process.env;
app.use(credentials_1.default);
app.use((0, cors_1.default)(cors_2.default));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
if (NODE_ENV === 'dev') {
    app.use(logger_1.default);
}
// Routes
app.use('/auth', auth_1.default);
// Catch all 404 route
app.get('*', (req, res) => {
    res.sendStatus(404);
});
app.listen(SERVER_PORT, () => {
    /* eslint-disable-next-line no-console */
    console.log(`Running on Port ${SERVER_PORT}`);
});
