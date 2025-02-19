import * as express from "express"
import {Response, Request, NextFunction} from "express"
import bcrypt from 'bcrypt';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import { promisify } from 'util';
import fs from "fs";
import i18next from "../../../providers/i18n/i18n"
import {executeQuery} from "../../../providers/mysqlProvider/mysqlProvider"
import generateSchema from "../../../schemas/admin/hotels";
import { logErrorAndRespond, validateContentType, validateRequestBodyKeys, validateRequestBody } from "../../../helpers/admin_herlpers"

const adminHotelsApi = express.Router()
adminHotelsApi.use(cookieParser());
const csrfProtection = csrf({ cookie: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {cb(null, 'uploads/');  },
  filename: function (req, file, cb) {cb(null, Date.now() + '-' + file.originalname);}
});

const upload = multer({
  storage: storage, 
  limits: { fileSize: 7 * 1024 * 1024 },
});

const readFileAsync = promisify(fs.readFile);


adminHotelsApi.post('/addnewhotel', csrfProtection, upload.single('logo'), async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if (!validateContentType(req, res, 'multipart/form-data;')) return;
    if (!validateRequestBodyKeys(req, res, ['name', 'verification', 'free_count', 'time_zone', 'plus_days_adjust', 'minus_days_adjust', 'active'])) return;
    if (!validateRequestBody(req, res, generateSchema, req.language, req.body)) return;
    let buffer = null;
    if(req.file){ 
      buffer = await readFileAsync(req.file.path);
      fs.unlink(req.file.path, (err) => {if (err) console.error('Error deleting file:', err);});
    }
    let result = await executeQuery('CALL create_hotel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[req.body.name, buffer, req.body.verification, req.body.free_count, req.body.time_zone, req.body.plus_days_adjust, req.body.minus_days_adjust, req.body.active, req.session.adminData?.companyID, req.session.adminData?.adminUser]);
    if(!(result as any) || !(result as any)[0][0]) return res.status(202).jsonp({status: "error", errorText: ''})
    return res.status(200).jsonp({status: "success", data: ((result as any)[0][0])});
  }catch(error){logErrorAndRespond("USER ERROR REPORT INSIDE CATCH adminApi.post('/addnewhotel', (req,res)=>{})", {script: "api.ts", scope: "adminApi.post('/addnewhotel', (req,res)=>{})", request: req, error:`${error}`},req,res);}
})

export default adminHotelsApi;