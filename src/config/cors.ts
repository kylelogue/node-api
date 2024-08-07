import { CorsOptions } from 'cors';

const { SERVER_URL, SERVER_PORT } = process.env;
const allowed = [`${SERVER_URL}:${SERVER_PORT}`];

const options: CorsOptions = {
    credentials: true,
    origin: allowed
};

export default options;