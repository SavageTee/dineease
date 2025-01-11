import * as winston from "winston"
import Flatted from "flatted";
import  Transport from 'winston-transport';
import {pool} from "../mysqlProvider/mysqlProvider"
import { v4 as uuidv4 } from 'uuid';

class MysqlTransport extends Transport {
  async log(info: any, callback: () => void){
       setImmediate(() => {this.emit('logged', info);});
       try {
        await pool.query(
          'CALL create_new_log(?, ?, ?, ?, ?)',
          [
            info.level,
            Flatted.stringify(info.message),
            Flatted.stringify({ metadata: info.metadata }),
            new Date(info.timestamp).toISOString().replace('T', ' ').replace('Z', ''),
            info.uuid,
          ]
        );
        callback(); 
      } catch (error) {
        console.error(`Error executing MYSQL query: ${error}`);
        callback();
      }
    }
  }

const logger = winston.createLogger({
   level: 'info',
   format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
   ),
   transports: [
     new winston.transports.File({ filename: 'error.log', level: 'error' }),
     new winston.transports.File({ filename: 'combined.log' }),
     new MysqlTransport()
   ],
});

const newLog = async ({level,message,metadata}:{level:string,message:string,metadata:any})=>{
  let uniqueID = uuidv4();
  logger.log({level:level, message:message, metadata:metadata, uuid:uniqueID})
  return uniqueID
}

export default newLog;
