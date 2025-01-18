import * as express from "express"
import { Response, Request, NextFunction } from "express"

import i18next from "../../providers/i18n/i18n"
import { executeQuery } from "../../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, errorPage, goBack } from "../../helpers/herlpers"

const admin = express.Router()

const checkIdParam = (req: Request, res: Response, next: NextFunction):any=> {
    const { id } = req.query;
    if (!id) return notFound(req, res);
    next(); 
};

admin.get('/login', checkIdParam, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      const { id } = req.query;
      if(id === undefined || id === null) return notFound(req,res);
      let rows = await executeQuery('CALL get_company(?)',[id]);
      if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null) return notFound(req,res);
      let companyInfo: companyInfo = {
        companyID: (rows as any)[0][0]['company_id'].toString(),
        companyName: (rows as any)[0][0]['company_name'],
        companyLogo: (rows as any)[0][0]['logo'],
      };
      req.session.data={ companyUUID: id.toString(), companyID: companyInfo.companyID };
      return res.render('admin/routes/login',{
          title: i18next.t('title',{ ns:'admin_login', lng:req.language }),
          companyID: companyInfo.companyID,
          companyName: companyInfo.companyName,
          usernameEmail: i18next.t('usernameEmail',{ ns:'admin_login', lng:req.language }),
          password: i18next.t('password',{ ns:'admin_login', lng:req.language }),
          login: i18next.t('login',{ ns:'admin_login', lng:req.language }),
          signIn: i18next.t('signIn',{ ns:'admin_login', lng:req.language }),
          signInHeader: i18next.t('signInHeader',{ ns:'admin_login', lng:req.language }),
          companyLogo: `data:image/jpeg;base64,${Buffer.from(companyInfo.companyLogo,'utf-8').toString('base64')}`,
      });
    }catch(error){return logErrorAndRespond("error occured in catch block of language.get('/', checkIdParam, (req,res)=>{})", {script: "language.ts", scope: "language.get('/', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

export default admin;