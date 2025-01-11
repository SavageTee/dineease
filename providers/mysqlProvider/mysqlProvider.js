"use strict";
/*import mysql from 'mysql2/promise';
import { PoolOptions } from 'mysql2/promise';*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = exports.options = exports.pool = void 0;
const mysql_1 = __importDefault(require("mysql"));
/*const options: PoolOptions = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectionLimit: 10,
};

let pool = mysql.createPool(options);*/
const options = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: 10,
};
exports.options = options;
let pool = mysql_1.default.createPool(options);
exports.pool = pool;
const executeQuery = (queryString, params) => {
    return new Promise((resolve, reject) => {
        pool.query(queryString, params, function (error, results) {
            if (error) {
                reject(error);
            }
            else {
                resolve(results);
            }
        });
    });
};
exports.executeQuery = executeQuery;
