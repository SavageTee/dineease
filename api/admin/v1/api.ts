import * as express from "express"
import {Response, Request, NextFunction} from "express"
import bcrypt from 'bcrypt';
import i18next from "../../../providers/i18n/i18n"
import {executeQuery} from "../../../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, errorPage, validateContentType, validateRequestBodyKeys, reportErrorAndRespond, ReportErrorAndRespondJsonGet } from "../../../helpers/herlpers"

const adminApi = express.Router()
adminApi.use(express.json({limit: '1mb'}))

adminApi.post('/report', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      if (!validateContentType(req, res)) return;
      if (!validateRequestBodyKeys(req, res, ["error"])) return;
      reportErrorAndRespond("USER ERROR REPORT INSIDE api.post('/report', (req,res)=>{})", {script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error:`${req.body.error}`},req,res);
    }catch(error){
      logErrorAndRespond("USER ERROR REPORT INSIDE CATCH api.post('/report', (req,res)=>{})", {script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error:`${error}`},req,res);
    }
})
  
adminApi.get('/adminstate', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      let data = req.session.adminData!;
      const states = [
        { state: 'login', keys: ['companyUUID'] },
        { state: 'login', keys: ['companyUUID', 'companyID'] }
      ];
      const matchedState = states.find(({ keys }) =>
        keys.every(key => key in data && data[key] !== undefined && data[key] !== null) &&
        Object.keys(data).length === keys.length
      );
      if (matchedState) {
        const keysToRemove = [''];
        keysToRemove.forEach(key => {
          if (matchedState.keys.includes(key)) {
            delete data[key];
          }
        });
        return res.status(200).jsonp({ state: matchedState.state });
      }
    }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of api.get('/state')", {script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error:`${error}`},req,res)}
})

adminApi.post('/login', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if (!validateContentType(req, res)) return;
    if (!validateRequestBodyKeys(req, res, ["username", "password"])) return;
    let result = await executeQuery('CALL admin_login(?, ?)',[req.body.username, req.session.adminData?.companyID]);
    if(!(result as any) || !(result as any)[0][0]) return res.status(202).jsonp({status: "error", errorText: i18next.t('invalidCredentials',{ ns:'admin_login', lng:req.language })});
    let isMatch = await bcrypt.compare(req.body.password, (result as any)[0][0]['password']);
    if(isMatch) return res.status(200).jsonp({status: "success"})
    return res.status(202).jsonp({status: "error", errorText: i18next.t('invalidCredentials',{ ns:'admin_login', lng:req.language })})
  }catch(error){logErrorAndRespond("USER ERROR REPORT INSIDE CATCH api.post('/report', (req,res)=>{})", {script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error:`${error}`},req,res);}
})

async function generateHash(password: string): Promise<string> {
  const saltRounds = 10;
  try {
      const hash = await bcrypt.hash(password, saltRounds);
      return hash;
  } catch (error) {
      console.error('Error generating hash:', error);
      throw error;
  }
}
//generateHash('talal').then((res)=> console.log(res));
export default adminApi;

