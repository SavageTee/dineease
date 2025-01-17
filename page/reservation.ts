import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../providers/i18n/i18n"
import { executeQuery } from "../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, errorPage, goBack } from "../helpers/herlpers"

const reservation = express.Router()

const checkIdParam = (req: Request, res: Response, next: NextFunction):any=> {
  const { id } = req.query;
  if (!id) return notFound(req, res);
  if(!req.session.data)req.session.data={};
  req.session.data.companyUUID=id.toString();
  next(); 
};

reservation.get('/', checkIdParam, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  return res.render('index',{title: i18next.t('title',{ns:'language', lng:req.language}),})
})

reservation.get('/language', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      let rows = await executeQuery('CALL get_company(?)',[req.session.data?.companyUUID]);
      if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null) return notFound(req,res);
      let companyInfo: companyInfo = {
        companyID: (rows as any)[0][0]['company_id'].toString(),
        companyName: (rows as any)[0][0]['company_name'],
        companyLogo: (rows as any)[0][0]['logo'],
      };
      req.session.data!.companyID = companyInfo.companyID;
      return res.render('routes/language',{
          companyID: companyInfo.companyID,
          companyName: companyInfo.companyName,
          companyLogo: `data:image/jpeg;base64,${Buffer.from(companyInfo.companyLogo,'utf-8').toString('base64')}`,
      });
    }catch(error){ console.log(error); return logErrorAndRespond("error occured in catch block of language.get('/', checkIdParam, (req,res)=>{})", {script: "language.ts", scope: "language.get('/', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/hotel', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      const rows = await executeQuery('CALL get_hotels(?)', [req.session.data!.companyID]);
      if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null ) return errorPage(req, res, i18next.t('titleNoHotel',{ns: 'hotel', lng: req.language }), i18next.t('errorHeaderNoHotel',{ns: 'hotel', lng: req.language }), i18next.t('errorBodyNoHotel',{ns: 'hotel', lng: req.language }));
      const hotels:hotel[] = (rows as any)[0].map((row: any) => ({
        hotelID: row['hotel_id'].toString(),
        name: row['name'],
        logo: row['logo'] ? `data:image/jpeg;base64,${Buffer.from(row['logo'],'utf-8').toString('base64')}` : null,
        verificationType: row['verification_type'],
        isSelected: row['hotel_id'].toString() === req.session.data?.hotelID
      }));
      return res.render('routes/hotel',{
          title: i18next.t('title',{ns: 'hotel', lng: req.language }),
          alertText: i18next.t('alertText',{ns: 'hotel', lng: req.language }),
          buttonText: i18next.t('buttonText',{ns: 'hotel', lng: req.language }),
          hotels: hotels,
          error: i18next.t('noHotelSelectedError',{ns: 'hotel', lng: req.language }),
          buttonTextExit: i18next.t('buttonTextExit',{ns: 'hotel', lng: req.language }),
      });
    }catch(error){logErrorAndRespond("error occured in catch block of reservation.get('/hotel', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/hotel', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

export default reservation;