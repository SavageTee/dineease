import * as express from "express"
import { Response, Request, NextFunction } from "express"
import csrf from 'csurf';
import cookieParser from 'cookie-parser';

import i18next from "../../providers/i18n/i18n"
import { executeQuery } from "../../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, ReportErrorAndRespondJsonGet  } from "../../helpers/herlpers"

const admin = express.Router()
admin.use(cookieParser());
const csrfProtection = csrf({ cookie: true });


const checkIdParam = (req: Request, res: Response, next: NextFunction):any=> {
  const { id } = req.query;
  if (!id) return notFound(req, res);
  if(!req.session.adminData)req.session.adminData={};
  req.session.adminData.companyUUID=id.toString();
  next(); 
};

admin.get('/', checkIdParam, csrfProtection, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    return res.render('index',{title: i18next.t('title',{ns:'admin_page', lng:req.language}),csrfToken: req.csrfToken()},(error, html)=>{if(error)throw error.toString();res.send(html)})
  }catch(error){return ReportErrorAndRespondJsonGet("error occured in catch block of admin.get('/', checkIdParam, (req,res)=>{})", {script: "admin.ts", scope: "admin.get('/', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

admin.get('/login', csrfProtection, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      let rows = await executeQuery('CALL get_company(?)',[req.session.adminData?.companyUUID]);
      if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null) return notFound(req,res);
      let companyInfo: companyInfo = {
        companyID: (rows as any)[0][0]['company_id'].toString(),
        companyName: (rows as any)[0][0]['company_name'],
        companyLogo: (rows as any)[0][0]['logo'],
      };
      req.session.adminData!['companyID'] = companyInfo.companyID;
      return res.render('routes/login',{
          title: i18next.t('title',{ ns:'admin_login', lng:req.language }),
          companyID: companyInfo.companyID,
          companyName: companyInfo.companyName,
          usernameEmail: i18next.t('usernameEmail',{ ns:'admin_login', lng:req.language }),
          password: i18next.t('password',{ ns:'admin_login', lng:req.language }),
          login: i18next.t('login',{ ns:'admin_login', lng:req.language }),
          signIn: i18next.t('signIn',{ ns:'admin_login', lng:req.language }),
          signInHeader: i18next.t('signInHeader',{ ns:'admin_login', lng:req.language }),
          companyLogo: `data:image/jpeg;base64,${Buffer.from(companyInfo.companyLogo,'utf-8').toString('base64')}`,
      },(error, html)=>{if(error)throw error.toString();res.send(html)});
    }catch(error){return ReportErrorAndRespondJsonGet("error occured in catch block of admin.get('/login', csrfProtection, (req,res)=>{})", {script: "admin.ts", scope: "login.get('/', csrfProtection, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

admin.get('/dashboard', csrfProtection, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      let rows = await executeQuery('CALL get_company(?)',[req.session.adminData?.companyUUID]);
      if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null) return notFound(req,res);
      let user = await executeQuery('CALL get_admin_user(?)',[req.session.adminData?.adminUser]);
      if((user as any)[0][0] === undefined || (user as any)[0][0] === null) return notFound(req,res);
      let companyInfo: companyInfo = {
        companyID: (rows as any)[0][0]['company_id'].toString(),
        companyName: (rows as any)[0][0]['company_name'],
        companyLogo: (rows as any)[0][0]['logo'],
      };
      let adminUser:adminUser = {
        userName: ((user as any)[0][0]['user_name'] as string).toUpperCase(),
        email:(user as any)[0][0]['email'],
        phone: (user as any)[0][0]['phone'],
        displayName: (user as any)[0][0]['display_name'],
        createdAt: (user as any)[0][0]['created_at'],
        admin: (user as any)[0][0]['admin'] === 1 ? true : false,
      }
      return res.render('routes/dashboard',{
        companyID: companyInfo.companyID,
        companyName: companyInfo.companyName,
        companyLogo: `data:image/jpeg;base64,${Buffer.from(companyInfo.companyLogo,'utf-8').toString('base64')}`,
        userName: adminUser.userName,
        email: adminUser.email,
        phone: adminUser.phone,
        displayName: adminUser.displayName,
        createdAt: adminUser.createdAt,
        admin: adminUser.admin ,

        userModalTitle: i18next.t('userModalTitle',{ ns:'admin_page', lng:req.language }),
        close: i18next.t('close',{ ns:'admin_page', lng:req.language }),
        saveChanges: i18next.t('saveChanges',{ ns:'admin_page', lng:req.language }),
        userNameTitle: i18next.t('userNameTitle',{ ns:'admin_page', lng:req.language }),
        displayNameTitle: i18next.t('displayNameTitle',{ ns:'admin_page', lng:req.language }),
        emailTitle: i18next.t('emailTitle',{ ns:'admin_page', lng:req.language }),
        phoneTitle: i18next.t('phoneTitle',{ ns:'admin_page', lng:req.language }),
        createdAtTitle: i18next.t('createdAtTitle',{ ns:'admin_page', lng:req.language }),
        isAdminTitle: i18next.t('isAdminTitle',{ ns:'admin_page', lng:req.language }),
        hotels: i18next.t('hotels',{ ns:'admin_page', lng:req.language }),
        statics: i18next.t('statics',{ ns:'admin_page', lng:req.language }),
      },(error, html)=>{if(error)throw error.toString();res.send(html)})
    }catch(error){return ReportErrorAndRespondJsonGet("error occured in catch block of admin.get('/dashboard', csrfProtection, (req,res)=>{})", {script: "admin.ts", scope: "admin.get('/dashboard', csrfProtection, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

admin.get('/statics', csrfProtection, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let rows = await executeQuery('CALL get_statics(?)',[req.session.adminData?.companyID]);
    if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null) return notFound(req,res);
    return res.render('routes/statics',{
        title: i18next.t('title',{ ns:'admin_login', lng:req.language }),
        mostLikedTitle: i18next.t('mostLikedTitle',{ ns:'statics', lng:req.language }),
        fullRestaurantsTitle: i18next.t('fullRestaurantsTitle',{ ns:'statics', lng:req.language }),
        TotalReservationsTitle: i18next.t('TotalReservationsTitle',{ ns:'statics', lng:req.language }),
    },(error, html)=>{if(error)throw error.toString();res.send(html)});
  }catch(error){return ReportErrorAndRespondJsonGet("error occured in catch block of admin.get('/statics', csrfProtection, (req,res)=>{})", {script: "admin.ts", scope: "login.get('/statics', csrfProtection, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

export default admin;