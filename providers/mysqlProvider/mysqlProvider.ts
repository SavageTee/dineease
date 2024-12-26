import * as mysql from 'mysql2';
import { PoolOptions } from 'mysql2/promise';

const options: PoolOptions = {
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
  // ssl  : {
     // ca : fs.readFileSync(__dirname + '/mysqlCerts/ca.pem'),
     // key : fs.readFileSync(__dirname + '/mysqlCerts/client-key.pem'),
     // cert : fs.readFileSync(__dirname + '/mysqlCerts/client-cert.pem')/
   // }
};

const pool = mysql.createPool(options);

export {
    pool,
    options,
}
