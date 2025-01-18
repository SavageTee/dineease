import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../../providers/i18n/i18n"
import { executeQuery } from "../../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, errorPage, goBack } from "../../helpers/herlpers"

const reservation = express.Router()

reservation.get('/hotel', sessionCheckCompany, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
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
    const rows = await executeQuery('CALL get_restaurants(?, ?)',[req.session.data!.hotelID, req.session.data!.companyID]);  
    const restaurants:restaurant[] = (rows as any)[0].map((row: any) => ({
      restaurantID: row['restaurants_id'].toString(),
      name: row['name'].toString(),
      country: row['country'].toString(),
      photo: row['photo'] ? `data:image/jpeg;base64,${Buffer.from(row['photo'],'utf-8').toString('base64')}` : null,
      about: row['about'].toString(),
      capacity: Number(row['capacity']),
      isSelected: row['restaurants_id'].toString() === req.session.data?.restaurantID,
      reservation_by_room: (rows as any)[0][0]['reservation_by_room'] === 1 ? true : false,
    }))
    return res.render('reservation/routes/restaurant',{
      title: i18next.t('title',{ns: 'restaurant', lng: req.language }),
      alertText: i18next.t('alertText',{ns: 'restaurant', lng: req.language }),
      buttonText: i18next.t('buttonText',{ns: 'restaurant', lng: req.language }),
      error: i18next.t('noSelectedRestaurant',{ns: 'restaurant', lng: req.language }),
      buttonTextExit: i18next.t('buttonTextExit',{ns: 'restaurant', lng: req.language }),
      restaurants: restaurants,
    });
  }catch(error){logErrorAndRespond("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/time', sessionCheckRestaurant, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    const rows_names =  await executeQuery('CALL get_names(?)',[req.session.data!.guest_reservation_id]); 
    if((rows_names as any)[0][0] != undefined){
        let names:string[] = (rows_names as any)[0][0]['names'].split(' |-| ');
        const rows_arrival_departure = await executeQuery('CALL get_pick_dates(?, ?, ?)',[req.session.data!.guest_reservation_id,req.session.data?.hotelID,req.session.data?.companyID]); 
        let dates:{start_date:string, end_date:string} = (rows_arrival_departure as any)[0][0];
        const start_date = new Date(dates['start_date']);
        const end_date = new Date(dates['end_date']);
        if (start_date > end_date) {
          let uuid = req.session.data?.companyUUID;
          req.session.destroy(()=>{})
          return errorPage(req, res, i18next.t('errorDepartureHead',{ns: 'time', lng: req.language }), i18next.t('errorDepartureHead',{ns: 'time', lng: req.language }), i18next.t('errorDepartureBody',{ns: 'time', lng: req.language }), i18next.t('copyError',{ns: 'time', lng: req.language }), i18next.t('goBack',{ns: 'time', lng: req.language }),true , uuid)
        }else{
          return res.render('reservation/routes/time',{
            title: i18next.t('title',{ns: 'time', lng: req.language }),
            alertText: i18next.t('alertText',{ns: 'time', lng: req.language }),
            buttonText: i18next.t('buttonText',{ns: 'time', lng: req.language }),
            error: i18next.t('noSelectedRestaurant',{ns: 'time', lng: req.language }),
            buttonTextExit: i18next.t('buttonTextExit',{ns: 'time', lng: req.language }),
            names: names,
            startDate: dates['start_date'],
            endDate: dates['end_date'],
            reservation_by_room: req.session.data?.reservation_by_room,
            paid: req.session.data?.paid,
            tableHeader: i18next.t('tableHeader',{ns: 'time', lng: req.language }),
            roomNumber: req.session.data!.roomNumber,
            RoomBasedReservation: i18next.t('RoomBasedReservation',{ns: 'time', lng: req.language }),
            paxBasedReservation: i18next.t('paxBasedReservation',{ns: 'time', lng: req.language }),
            selectYourDate: i18next.t('selectYourDate',{ns: 'time', lng: req.language }),
          });
        }
    }else{goBack(res)}
  }catch(error){logErrorAndRespond("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/confirm', sessionCheckRestaurant, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
     let rows = await executeQuery('CALL get_company(?)',[req.session.data?.companyUUID]);
      if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null) return notFound(req,res);
      let companyInfo: companyInfo = {
        companyID: (rows as any)[0][0]['company_id'].toString(),
        companyName: (rows as any)[0][0]['company_name'],
        companyLogo: (rows as any)[0][0]['logo'],
      };

    return res.render('reservation/routes/confirm',{
      title: i18next.t('title',{ns: 'restaurant', lng: req.language }),
      companyID: companyInfo.companyID,
      companyName: companyInfo.companyName,
      companyLogo: `data:image/jpeg;base64,${Buffer.from(companyInfo.companyLogo,'utf-8').toString('base64')}`,
      alertText: i18next.t('alertText',{ns: 'restaurant', lng: req.language }),
      buttonText: i18next.t('buttonText',{ns: 'restaurant', lng: req.language }),
      error: i18next.t('noSelectedRestaurant',{ns: 'restaurant', lng: req.language }),
      buttonTextExit: i18next.t('buttonTextExit',{ns: 'restaurant', lng: req.language }),
      qrCOde: req.session.data?.qrCode
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

function sessionCheckTime(req:Request,res:Response,next:NextFunction){
  if( req.session.data && req.session.data !== null && req.session.data.companyUUID && req.session.data.companyID && req.session.data.hotelID && req.session.data.roomNumber && (req.session.data.paid !== undefined) && (req.session.data.reservation_by_room !== undefined) && (req.session.data.guest_reservation_id !== undefined) ){
    next()
  }else{goBack(res)}
}

export default reservation;