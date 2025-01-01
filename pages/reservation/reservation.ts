import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../../providers/i18n/i18n"
import {pool} from "../../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, errorPage } from "../../helpers/herlpers"

const reservation = express.Router()

reservation.get('/hotel', sessionCheck , async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      const [rows] = await pool.promise().query('CALL get_hotels(?)',[req.session.data!.companyID]);  
      if( (rows as any)[0][0] === undefined || (rows as any)[0][0] === null ) return errorPage(req, res, i18next.t('titleNoHotel',{ns: 'reservation', lng: req.language }), i18next.t('errorHeaderNoHotel',{ns: 'reservation', lng: req.language }), i18next.t('errorBodyNoHotel',{ns: 'reservation', lng: req.language }));
      const hotels:hotels[] = (rows as any)[0].map((row: any) => ({
        hotelID: row['hotel_id'].toString(),
        name: row['name'],
        logo: row['logo'] ? `data:image/jpeg;base64,${Buffer.from(row['logo'],'utf-8').toString('base64')}` : null,
        verificationType: row['verification_type'],
        isSelected: row['hotel_id'].toString() === req.session.data?.hotelID
      }));
      res.render('reservation/routes/hotel',{
          title: i18next.t('title',{ns: 'reservation', lng: req.language }),
          alertText: i18next.t('alertText',{ns: 'reservation', lng: req.language }),
          buttonText: i18next.t('buttonText',{ns: 'reservation', lng: req.language }),
          hotels: hotels,
          type: 'hotel',
          error: i18next.t('noHotelSelectedError',{ns: 'reservation', lng: req.language }),
      });
    }catch(error){logErrorAndRespond("error occured in catch block of reservation.get('/', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/room', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    res.render('reservation/routes/room',{
      title: i18next.t('title',{ns: 'room', lng: req.language }),
      alertText: i18next.t('alertText',{ns: 'room', lng: req.language }),
      buttonText: i18next.t('buttonText',{ns: 'room', lng: req.language }),
      error: i18next.t('noHotelSelectedError',{ns: 'room', lng: req.language }),
      confirmButton: i18next.t('confirmButton',{ns: 'room', lng: req.language }),
    });
  }catch(error){logErrorAndRespond("error occured in catch block of reservation.get('/', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

function sessionCheck(req:Request,res:Response,next:NextFunction){
    if( req.session.data && req.session.data !== null && req.session.data.companyUUID && req.session.data.companyID ){
      next()
    }else{
      res.redirect('/');
    }
}

export default reservation;