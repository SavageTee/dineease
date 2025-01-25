import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../providers/i18n/i18n"
import { executeQuery } from "../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, ReportErrorAndRespondJsonGet, errorPage } from "../helpers/herlpers"

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
      },(error, html)=>{if(error)throw error.toString();res.send(html)});
    }catch(error){return ReportErrorAndRespondJsonGet("error occured in catch block of language.get('/', checkIdParam, (req,res)=>{})", {script: "language.ts", scope: "language.get('/', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/hotel', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      const rows = await executeQuery('CALL get_hotels(?)', [req.session.data!.companyID]);
      //if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null ) return errorPage(req, res, i18next.t('titleNoHotel',{ns: 'hotel', lng: req.language }), i18next.t('errorHeaderNoHotel',{ns: 'hotel', lng: req.language }), i18next.t('errorBodyNoHotel',{ns: 'hotel', lng: req.language }));
      const hotels:hotel[] = (rows as any)[0].map((row: any) => ({
        hotelID: row['hotel_id'].toString(),
        name: row['name'],
        logo: row['logo'] ? `data:image/jpeg;base64,${Buffer.from(row['logo'],'utf-8').toString('base64')}` : null,
        verificationType: row['verification_type'],
        isSelected: row['hotel_id'].toString() === req.session.data?.hotelID
      }));
      return res.render('routes/hotel',{
          alertText: i18next.t('alertText',{ns: 'hotel', lng: req.language }),
          buttonText: i18next.t('buttonText',{ns: 'hotel', lng: req.language }),
          hotels: hotels,
          error: i18next.t('noHotelSelectedError',{ns: 'hotel', lng: req.language }),
          buttonTextExit: i18next.t('buttonTextExit',{ns: 'hotel', lng: req.language }),
      },(error, html)=>{if(error)throw error.toString();res.send(html)});
    }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of reservation.get('/hotel', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/hotel', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/room', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    return res.render('routes/room',{
      title: i18next.t('title',{ns: 'room', lng: req.language }),
      alertText: i18next.t('alertText',{ns: 'room', lng: req.language }),
      buttonText: i18next.t('buttonText',{ns: 'room', lng: req.language }),
      error: i18next.t('noHotelSelectedError',{ns: 'room', lng: req.language }),
      confirmButton: i18next.t('confirmButton',{ns: 'room', lng: req.language }),
      buttonTextExit: i18next.t('buttonTextExit',{ns: 'room', lng: req.language }),
    },(error, html)=>{if(error)throw error.toString();res.send(html)});
  }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of reservation.get('/room', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/room', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/restaurant', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    const rows = await executeQuery('CALL get_restaurants(?)',[req.session.data!.companyID]);  
    const restaurants:restaurant[] = (rows as any)[0].map((row: any) => ({
      restaurantID: row['restaurants_id'].toString(),
      name: row['name'].toString(),
      country: row['country'].toString(),
      photo: row['photo'] ? `data:image/jpeg;base64,${Buffer.from(row['photo'],'utf-8').toString('base64')}` : null,
      about: row['about'].toString(),
      capacity: Number(row['capacity']),
      isSelected: row['restaurants_id'].toString() === req.session.data?.restaurantID,
    }))
    return res.render('routes/restaurant',{
      title: i18next.t('title',{ns: 'restaurant', lng: req.language }),
      alertText: i18next.t('alertText',{ns: 'restaurant', lng: req.language }),
      buttonText: i18next.t('buttonText',{ns: 'restaurant', lng: req.language }),
      error: i18next.t('noSelectedRestaurant',{ns: 'restaurant', lng: req.language }),
      buttonTextExit: i18next.t('buttonTextExit',{ns: 'restaurant', lng: req.language }),
      restaurants: restaurants,
    },(error, html)=>{if(error)throw error.toString();res.send(html)});
  }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})",{script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request:req , error:`${error}`}, req, res );}
})


reservation.get('/time', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
      const rows_arrival_departure = await executeQuery('CALL get_pick_dates(?, ?, ?)',[req.session.data!.guest_reservation_id,req.session.data?.hotelID,req.session.data?.companyID]); 
      let dates:{start_date:string, end_date:string, tz:string} = (rows_arrival_departure as any)[0][0];
      const start_date = new Date(dates['start_date']);
      const end_date = new Date(dates['end_date']);
      if (start_date > end_date) {
        return errorPage(req, res, i18next.t('errorDepartureHead',{ns: 'time', lng: req.language }), i18next.t('errorDepartureHead',{ns: 'time', lng: req.language }), i18next.t('errorDepartureBody',{ns: 'time', lng: req.language }), i18next.t('copyError',{ns: 'time', lng: req.language }), i18next.t('goBack',{ns: 'time', lng: req.language }),true)
      }else{
        return res.render('routes/time',{
          title: i18next.t('title',{ns: 'time', lng: req.language }),
          alertText: i18next.t('alertText',{ns: 'time', lng: req.language }),
          buttonText: i18next.t('buttonText',{ns: 'time', lng: req.language }),
          error: i18next.t('noSelectedRestaurant',{ns: 'time', lng: req.language }),
          buttonTextExit: i18next.t('buttonTextExit',{ns: 'time', lng: req.language }),
          startDate: dates['start_date'],
          endDate: dates['end_date'],
          paid: req.session.data?.paid,
          tableHeader: `${i18next.t('tableHeader',{ns: 'time', lng: req.language })} ${dates['tz']}` ,
          roomNumber: req.session.data!.roomNumber,
          selectYourDate: i18next.t('selectYourDate',{ns: 'time', lng: req.language }),
        },(error, html)=>{if(error)throw error.toString();res.send(html)});
      }
  }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})



reservation.get('/confirm', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
     let rows = await executeQuery('CALL get_confirm_qr(?)',[req.session.data?.qrCode]);
      if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null) return notFound(req,res);
      let confirmResult: confirm = {
        roomNumber: (rows as any)[0][0]['room_number'],
        pax: (rows as any)[0][0]['pax'],
        hotelName: (rows as any)[0][0]['name'],
        names: (rows as any)[0][0]['names'],
        restaurant: (rows as any)[0][0]['restaurant'],
        day: (rows as any)[0][0]['day'],
        time: (rows as any)[0][0]['time'],
        createdAt: `${(rows as any)[0][0]['created_at'].toString()} (${(rows as any)[0][0]['tz'].toString()})`,
        paid: (rows as any)[0][0]['paid'],
        totalAmmount: (rows as any)[0][0]['total_ammount'],
        price: (rows as any)[0][0]['price'],
        currency: (rows as any)[0][0]['currency'],
        companyName: (rows as any)[0][0]['company_name'],
        logo: (rows as any)[0][0]['logo'],
        tz: (rows as any)[0][0]['tz'],
      };
      console.log(confirmResult)
      return res.render('routes/confirm',{
        title: i18next.t('title',{ns: 'restaurant', lng: req.language }),
        companyName: confirmResult.companyName,
        companyLogo: `data:image/jpeg;base64,${Buffer.from(confirmResult.logo,'utf-8').toString('base64')}`,
        qrCOde: req.session.data?.qrCode,
        hotelHeader: i18next.t('hotelHeader',{ns: 'confirm', lng: req.language }),
        paxHeader: i18next.t('paxHeader',{ns: 'confirm', lng: req.language }),
        roomNumberHeader: i18next.t('roomNumberHeader',{ns: 'confirm', lng: req.language }),
        hotel: confirmResult.hotelName,
        roomNumber: confirmResult.roomNumber,
        pax: confirmResult.pax,

        restaurantHeader: i18next.t('restaurantHeader',{ns: 'confirm', lng: req.language }),
        dateHeader: i18next.t('dateHeader',{ns: 'confirm', lng: req.language }),
        timeHeader: i18next.t('timeHeader',{ns: 'confirm', lng: req.language }),
        restaurant: confirmResult.restaurant,
        date: confirmResult.day,
        time: confirmResult.time,
        guestsHeader: i18next.t('guestsHeader',{ns: 'confirm', lng: req.language }),
        guests: confirmResult.names.split(' |-| '),
        createdAt: confirmResult.createdAt,

        paymentHeader: i18next.t('paymentHeader',{ns: 'confirm', lng: req.language }),
        freeHeader: i18next.t('freeHeader',{ns: 'confirm', lng: req.language }),
        paid: confirmResult.paid === 1 ? true : false,
        totalAmmount: confirmResult.totalAmmount,
        currency: confirmResult.currency,
        timeZone: `${i18next.t('timeZoneMessage',{ns: 'confirm', lng: req.language })}${confirmResult.tz}`

      },(error, html)=>{if(error)throw error.toString();res.send(html)});
  }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

export default reservation;