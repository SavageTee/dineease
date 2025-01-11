/*import mysql from 'mysql2/promise';
import { PoolOptions } from 'mysql2/promise';*/

import mysql, { MysqlError } from "mysql";
import {PoolConfig} from "mysql"
import { QueryResult } from "mysql2";


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


const options: PoolConfig = {
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
	connectionLimit: 10,
};

let pool = mysql.createPool(options);


const executeQuery = (queryString:string, params:Object):Promise<QueryResult | MysqlError> =>{
	return new Promise<QueryResult>((resolve, reject) => {
		pool.query(queryString,params, function (error, results) {
			if (error){reject(error);} else {resolve(results);}
		});
	})
}

//setInterval(async () => {try {pool.query('SELECT 1'); console.log('keep alive')} catch (err) {console.error('Keep-alive query failed:', err);}}, 60000);

export {
    pool,
    options,
	executeQuery
}
