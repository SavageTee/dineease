import * as mysql from 'mysql2';
import { PoolOptions } from 'mysql2/promise';

const options: PoolOptions = {
  pool: true,
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

let pool = mysql.createPool(options);
/*pool.on('error', function (err) {pool = mysql.createPool(options);});*/

export {
    pool,
    options,
}
