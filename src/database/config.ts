import * as dotenv from 'dotenv';
dotenv.config();

module.exports = {
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: process.env.POSTGRES_LOCAL_PORT,
};