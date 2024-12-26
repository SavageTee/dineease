"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const mysqlProvider_1 = require("../mysqlProvider/mysqlProvider");
const opts = {
    storeClient: mysqlProvider_1.pool,
    dbName: process.env.POSTGRESQL_DATABASE,
    tableName: process.env.POSTGRESQL_LIMIT_TABLE,
    points: Number(process.env.LIMIT_POINTS),
    duration: Number(process.env.LIMIT_DURATION),
};
exports.rateLimiter = new rate_limiter_flexible_1.RateLimiterPostgres(opts);
