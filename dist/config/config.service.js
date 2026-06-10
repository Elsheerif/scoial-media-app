import path from 'path';
import dotenv from 'dotenv';
export const NODE_ENV = process.env.NODE_ENV;
const envPath = {
    dev: path.resolve("./config/.env.dev"),
    prod: path.resolve("./config/.env.prod"),
};
dotenv.config({ path: path.resolve("./.env.dev") });
dotenv.config({ path: path.resolve("./.env.dev") });
export const SERVER_PORT = process.env.PORT || 3000;
export const DB_URL_LOCAL = process.env.DB_URL_LOCAL || "";
export const DB_URL_ATLAS = process.env.DB_URL_ATLAS || "";
export const REDIS_URL = process.env.REDIS_URL;
export const SALT_ROUND = parseInt(process.env.SALT_ROUND) || 10;
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const TOKEN_SIGNATURE_User_ACCESS = process.env
    .TOKEN_SIGNATURE_User_ACCESS;
export const TOKEN_SIGNATURE_Admin_ACCESS = process.env
    .TOKEN_SIGNATURE_Admin_ACCESS;
export const TOKEN_SIGNATURE_User_REFRESH = process.env
    .TOKEN_SIGNATURE_User_REFRESH;
export const TOKEN_SIGNATURE_Admin_REFRESH = process.env
    .TOKEN_SIGNATURE_Admin_REFRESH;
export const MAIL_PASS = process.env.MAIL_PASS;
export const MAIL_USER = process.env.MAIL_USER;
