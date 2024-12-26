import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../../providers/i18n/i18n"
import {pool} from "../../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond } from "../../helpers/herlpers"

const reservation = express.Router()
reservation.use(sessionCheck)

reservation.get('/', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      const { id } = req.query;
      const [rows] = await pool.promise().query('CALL get_company(?)',[id]);
      let companyInfo:companyInfo = {
        companyID: (rows as any)[0][0]['company_id'],
        companyName: (rows as any)[0][0]['company_name'],
        companyLogo: (rows as any)[0][0]['logo'],
      };
      res.render('language/index',{
          title: i18next.t('welcome',{ns: 'reservation', lng: req.language }),
          companyID: companyInfo.companyID,
          companyName: companyInfo.companyName,
          companyLogo: `data:image/jpeg;base64,${Buffer.from(companyInfo.companyLogo,'utf-8').toString('base64')}`,
      });
    }catch(error){logErrorAndRespond("error occured in catch block of reservation.get('/', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

function sessionCheck(req:Request,res:Response,next:NextFunction){
    if(req.session.hasOwnProperty('uname')){next()}else{
         res.redirect('/');
    }
}

export default reservation;