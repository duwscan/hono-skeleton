import 'dotenv/config';

export const databaseConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT!),
    password: process.env.DB_PASSWORD,
}