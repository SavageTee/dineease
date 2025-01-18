import {IRateLimiterStoreNoAutoExpiryOptions,RateLimiterPostgres} from "rate-limiter-flexible"
import {pool} from "../mysqlProvider/mysqlProvider"

const opts:IRateLimiterStoreNoAutoExpiryOptions = {
    storeClient: pool,
    dbName: process.env.POSTGRESQL_DATABASE,
    tableName: process.env.POSTGRESQL_LIMIT_TABLE,
    points: Number(process.env.LIMIT_POINTS),
    duration: Number(process.env.LIMIT_DURATION),
};

export const rateLimiter = new RateLimiterPostgres(opts);

