import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../../providers/i18n/i18n"
import {pool} from "../../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, errorPage, goBack } from "../../helpers/herlpers"

const reservation = express.Router()

reservation.get('/hotel', sessionCheckCompany, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      const [rows] = await pool.promise().query('CALL get_hotels(?)',[req.session.data!.companyID]);  
      if( (rows as any)[0][0] === undefined || (rows as any)[0][0] === null ) return errorPage(req, res, i18next.t('titleNoHotel',{ns: 'hotel', lng: req.language }), i18next.t('errorHeaderNoHotel',{ns: 'hotel', lng: req.language }), i18next.t('errorBodyNoHotel',{ns: 'hotel', lng: req.language }));
      const hotels:hotel[] = (rows as any)[0].map((row: any) => ({
        hotelID: row['hotel_id'].toString(),
        name: row['name'],
        logo: row['logo'] ? `data:image/jpeg;base64,${Buffer.from(row['logo'],'utf-8').toString('base64')}` : null,
        verificationType: row['verification_type'],
        isSelected: row['hotel_id'].toString() === req.session.data?.hotelID
      }));
      return res.render('reservation/routes/hotel',{
          title: i18next.t('title',{ns: 'hotel', lng: req.language }),
          alertText: i18next.t('alertText',{ns: 'hotel', lng: req.language }),
          buttonText: i18next.t('buttonText',{ns: 'hotel', lng: req.language }),
          hotels: hotels,
          type: 'hotel',
          error: i18next.t('noHotelSelectedError',{ns: 'hotel', lng: req.language }),
          buttonTextExit: i18next.t('buttonTextExit',{ns: 'hotel', lng: req.language }),
      });
    }catch(error){logErrorAndRespond("error occured in catch block of reservation.get('/hotel', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/hotel', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/room', sessionCheckHotel, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    return res.render('reservation/routes/room',{
      title: i18next.t('title',{ns: 'room', lng: req.language }),
      alertText: i18next.t('alertText',{ns: 'room', lng: req.language }),
      buttonText: i18next.t('buttonText',{ns: 'room', lng: req.language }),
      error: i18next.t('noHotelSelectedError',{ns: 'room', lng: req.language }),
      confirmButton: i18next.t('confirmButton',{ns: 'room', lng: req.language }),
      buttonTextExit: i18next.t('buttonTextExit',{ns: 'room', lng: req.language }),
    });
  }catch(error){logErrorAndRespond("error occured in catch block of reservation.get('/room', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/room', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/restaurant', sessionCheckRestaurant, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    const [rows] = await pool.promise().query('CALL get_restaurants(?, ?)',[req.session.data!.hotelID, req.session.data!.companyID]);  
    const restaurants:restaurant[] = (rows as any)[0].map((row: any) => ({
      restaurantID: row['restaurants_id'].toString(),
      name: row['name'].toString(),
      country: row['country'].toString(),
      photo: row['photo'] ? `data:image/jpeg;base64,${Buffer.from(row['photo'],'utf-8').toString('base64')}` : null,
      about: row['about'].toString(),
      capacity: Number(row['capacity'])
    }))
    return res.render('reservation/routes/restaurant',{
      title: i18next.t('title',{ns: 'restaurant', lng: req.language }),
      alertText: i18next.t('alertText',{ns: 'restaurant', lng: req.language }),
      buttonText: i18next.t('buttonText',{ns: 'restaurant', lng: req.language }),
      buttonTextExit: i18next.t('buttonTextExit',{ns: 'restaurant', lng: req.language }),
      restaurants: restaurants
    });
  }catch(error){logErrorAndRespond("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

function sessionCheckCompany(req:Request,res:Response,next:NextFunction){
  if( req.session.data && req.session.data !== null && req.session.data.companyUUID && req.session.data.companyID ){
    next()
  }else{goBack(res)}
}

function sessionCheckHotel(req:Request,res:Response,next:NextFunction){
  if( req.session.data && req.session.data !== null && req.session.data.companyUUID && req.session.data.companyID && req.session.data.hotelID ){
    next()
  }else{goBack(res)}
}

function sessionCheckRestaurant(req:Request,res:Response,next:NextFunction){
  if( req.session.data && req.session.data !== null && req.session.data.companyUUID && req.session.data.companyID && req.session.data.hotelID && req.session.data.roomNumber && (req.session.data.paid !== undefined) ){
    next()
  }else{goBack(res)}
}

export default reservation;