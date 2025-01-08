import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../../providers/i18n/i18n"
import {pool} from "../../providers/mysqlProvider/mysqlProvider"
import { errorPage, logErrorAndRespond } from "../../helpers/herlpers"
import {notFound} from "../../helpers/herlpers"

const language = express.Router()

const checkIdParam = (req: Request, res: Response, next: NextFunction):any=> {
    const { id } = req.query;
    if (!id) {
      return res.render('404/index',{
        title: i18next.t('title',{ns: '404', lng: req.language }),
        errorHeader: i18next.t('errorHeader',{ns: '404', lng: req.language }),
        errorBody: i18next.t('errorBody',{ns: '404', lng: req.language }),
      })
    }
    next(); 
};

language.get('/', checkIdParam, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      const { id } = req.query;
      if(id === undefined || id === null) return notFound(req,res);
      const [rows] = await pool.promise().query('CALL get_company(?)',[id]);
      if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null) return notFound(req,res);
      let companyInfo:companyInfo = {
        companyID: (rows as any)[0][0]['company_id'].toString(),
        companyName: (rows as any)[0][0]['company_name'],
        companyLogo: (rows as any)[0][0]['logo'],
      };
      req.session.data={ companyUUID:id.toString(), companyID:companyInfo.companyID };
      return res.render('language/index',{
          title: i18next.t('welcome',{ns: 'reservation', lng: req.language }),
          companyID: companyInfo.companyID,
          companyName: companyInfo.companyName,
          companyLogo: `data:image/jpeg;base64,${Buffer.from(companyInfo.companyLogo,'utf-8').toString('base64')}`,
      });
    }catch(error){return logErrorAndRespond("error occured in catch block of language.get('/', checkIdParam, (req,res)=>{})", {script: "language.ts", scope: "language.get('/', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

export default language;