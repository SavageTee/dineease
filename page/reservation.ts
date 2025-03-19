import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../providers/i18n/i18n"
import { executeQuery } from "../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, ReportErrorAndRespondJsonGet, errorPage, getLanguage, convertFileToBase64 } from "../helpers/herlpers"

const reservation = express.Router()

const checkIdParam = (req: Request, res: Response, next: NextFunction):any=> {
  const { id } = req.query;
  if (!id) return notFound(req, res);
  if(!req.session.data)req.session.data={};
  req.session.data.companyUUID=id.toString();
  next(); 
};

reservation.get('/', checkIdParam, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    return res.render('index',{title: i18next.t('title',{ns:'language', lng:lng}),},(error, html)=>{if(error)throw error.toString();res.send(html)})
  }catch(error){return ReportErrorAndRespondJsonGet("error occured in catch block of reservation.get('/', checkIdParam, (req,res)=>{})", {script: "language.ts", scope: "reservation.get('/', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/language', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      let rows = await executeQuery('CALL get_company(?)',[req.session.data?.companyUUID]);
      if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null) return notFound(req,res);
      let logo_base64 = await convertFileToBase64((rows as any)[0][0]['logo_url']);
      let companyInfo: companyInfo = {
        companyID: (rows as any)[0][0]['company_id'].toString(),
        companyName: (rows as any)[0][0]['company_name'],
        companyLogo: logo_base64,
      };
      req.session.data!.companyID = companyInfo.companyID;
      return res.render('routes/language',{
          companyID: companyInfo.companyID,
          companyName: companyInfo.companyName,
          companyLogo: companyInfo.companyLogo,
      },(error, html)=>{if(error)throw error.toString();res.send(html)});
    }catch(error){return ReportErrorAndRespondJsonGet("error occured in catch block of language.get('/language', (req,res)=>{})", {script: "language.ts", scope: "language.get('/language', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/hotel', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      let lng:string = getLanguage(req);
      const rows = await executeQuery('CALL get_hotels(?, ?)', [req.session.data!.companyID, 1]);
      if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null ) return errorPage(req, res, i18next.t('titleNoHotel',{ns: 'hotel', lng: lng}), i18next.t('errorHeaderNoHotel',{ns: 'hotel', lng: lng}), i18next.t('errorBodyNoHotel',{ns: 'hotel', lng: lng}));
      const hotels:hotel[] = await Promise.all((rows as any)[0].map(async (row: any) => ({
        hotelID: row['hotel_id'].toString(),
        name: row['name'],
        logo: await convertFileToBase64(row['logo_url']),
        verificationType: row['verification_type'],
        isSelected: row['hotel_id'].toString() === req.session.data?.hotelID
      })));
      return res.render('routes/hotel',{
          alertText: i18next.t('alertText',{ns: 'hotel', lng: lng }),
          buttonText: i18next.t('buttonText',{ns: 'hotel', lng: lng }),
          hotels: hotels,
          error: i18next.t('noHotelSelectedError',{ns: 'hotel', lng: lng }),
          buttonTextExit: i18next.t('buttonTextExit',{ns: 'hotel', lng: lng }),
      },(error, html)=>{if(error)throw error.toString();res.send(html)});
    }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of reservation.get('/hotel', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/hotel', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/room', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    return res.render('routes/room',{
      title: i18next.t('title',{ns: 'room', lng: lng}),
      alertText: i18next.t('alertText',{ns: 'room', lng: lng}),
      buttonText: i18next.t('buttonText',{ns: 'room', lng: lng}),
      error: i18next.t('noHotelSelectedError',{ns: 'room', lng: lng}),
      confirmButton: i18next.t('confirmButton',{ns: 'room', lng: lng}),
      buttonTextExit: i18next.t('buttonTextExit',{ns: 'room', lng: lng}),
    },(error, html)=>{if(error)throw error.toString();res.send(html)});
  }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of reservation.get('/room', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/room', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/restaurant', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    const rows = await executeQuery('CALL get_restaurants(?, ?, ?, ?)',[req.session.data!.companyID, 1, lng, req.session.data?.hotelID]);  
    const restaurants: restaurant[] = await Promise.all(
      (rows as any)[0].map(async (row: any) => ({
        restaurantID: row['restaurants_id']?.toString() ?? '',
        name: row['name']?.toString() ?? '',
        country: row['cuisine']?.toString() ?? '',
        photo: await convertFileToBase64(row['logo_url']),
        about: row['about']?.toString() ?? '',
        capacity: Number(row['capacity'] ?? '1'),
        isSelected: row['restaurants_id'].toString() === req.session.data?.restaurantID,
        hotel_id: row['hotel_id']?.toString() ?? '',
        hotel_name: row['hotel_name']?.toString() ?? '',
        restricted_restaurants: row['restricted_restaurants'],
        always_paid_free: row['always_paid_free'],
      }))
    );
    return res.render('routes/restaurant',{
      title: i18next.t('title',{ns: 'restaurant', lng: lng }),
      alertText: i18next.t('alertText',{ns: 'restaurant', lng: lng }),
      buttonText: i18next.t('buttonText',{ns: 'restaurant', lng: lng }),
      error: i18next.t('noSelectedRestaurant',{ns: 'restaurant', lng: lng }),
      buttonTextExit: i18next.t('buttonTextExit',{ns: 'restaurant', lng: lng }),
      restaurants: restaurants,
      viewMenu: i18next.t('viewMenu',{ns: 'restaurant', lng: lng }),
      orederBeforeBooking: i18next.t('orederBeforeBooking',{ns: 'restaurant', lng: lng }), 
      orederBeforeBookingAlert: i18next.t('orederBeforeBookingAlert',{ns: 'restaurant', lng: lng }), 
      menuModalTitle: i18next.t('menuModalTitle',{ns: 'restaurant', lng: lng }),
      close: i18next.t('close',{ns: 'restaurant', lng: lng }),
      dateTableTitle: i18next.t('dateTableTitle',{ns: 'restaurant', lng: lng }),
      timeTableTitle: i18next.t('timeTableTitle',{ns: 'restaurant', lng: lng }),
      timeZoneTableTitle: i18next.t('timeZoneTableTitle',{ns: 'restaurant', lng: lng }),
      mealTypeTableTitle: i18next.t('mealTypeTableTitle',{ns: 'restaurant', lng: lng }),
      warningCrossHotel: i18next.t('warningCrossHotel',{ns: 'restaurant', lng: lng}),
      selectedHotel: req.session.data?.hotelID,
      alwaysPaid: i18next.t('alwaysPaid',{ns: 'restaurant', lng: lng}),    
      confirmModalContinueButton: i18next.t('confirmModalContinueButton',{ns: 'restaurant', lng: lng}), 
      confirmModalCancelButton: i18next.t('confirmModalCancelButton',{ns: 'restaurant', lng: lng}), 
      confirmModalTitle: i18next.t('confirmModalTitle',{ns: 'restaurant', lng: lng}), 
      alwaysFree: i18next.t('alwaysFree',{ns: 'restaurant', lng: lng}),  
    },(error, html)=>{if(error)throw error.toString();res.send(html)});
  }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})",{script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request:req , error:`${error}`}, req, res );}
})


reservation.get('/time', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
      let lng:string = getLanguage(req);
      const rows_arrival_departure = await executeQuery('CALL get_pick_dates(?, ?, ?)',[req.session.data!.guest_reservation_id,req.session.data?.restaurantID,req.session.data?.companyID]); 
      let dates:{start_date:string, end_date:string, tz:string} = (rows_arrival_departure as any)[0][0];
      const start_date = new Date(dates['start_date']);
      const end_date = new Date(dates['end_date']);
      if (start_date > end_date) {
        return errorPage(req, res, i18next.t('errorDepartureHead',{ns: 'time', lng: lng }), i18next.t('errorDepartureHead',{ns: 'time', lng: lng }), i18next.t('errorDepartureBody',{ns: 'time', lng: lng }), i18next.t('copyError',{ns: 'time', lng: lng }), i18next.t('goBack',{ns: 'time', lng: lng }),true)
      }else{
        return res.render('routes/time',{
          title: i18next.t('title',{ns: 'time', lng: lng }),
          alertText: i18next.t('alertText',{ns: 'time', lng: lng }),
          buttonText: i18next.t('buttonText',{ns: 'time', lng: lng }),
          error: i18next.t('noSelectedRestaurant',{ns: 'time', lng: lng }),
          buttonTextExit: i18next.t('buttonTextExit',{ns: 'time', lng: lng }),
          startDate: dates['start_date'],
          endDate: dates['end_date'],
          paid: req.session.data?.paid,
          tableHeader: `${i18next.t('tableHeader',{ns: 'time', lng: lng })} ${dates['tz']}` ,
          roomNumber: req.session.data!.roomNumber,
          selectYourDate: i18next.t('selectYourDate',{ns: 'time', lng: lng }),
          total: i18next.t('total',{ns: 'time', lng: lng }),
          noSelectedGuestsError: i18next.t('noSelectedGuestsError',{ns: 'time', lng: lng }),
          noSelectedTimeError: i18next.t('noSelectedTimeError',{ns: 'time', lng: lng }),
        },(error, html)=>{if(error)throw error.toString();res.send(html)});
      }
  }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

reservation.get('/confirm', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
      let lng:string = getLanguage(req);
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
      return res.render('routes/confirm',{
        title: i18next.t('title',{ns: 'restaurant', lng: lng }),
        companyName: confirmResult.companyName,
        companyLogo: `data:image/jpeg;base64,${Buffer.from(confirmResult.logo,'utf-8').toString('base64')}`,
        qrCOde: req.session.data?.qrCode,
        hotelHeader: i18next.t('hotelHeader',{ns: 'confirm', lng: lng }),
        paxHeader: i18next.t('paxHeader',{ns: 'confirm', lng: lng }),
        roomNumberHeader: i18next.t('roomNumberHeader',{ns: 'confirm', lng: lng }),
        hotel: confirmResult.hotelName,
        roomNumber: confirmResult.roomNumber,
        pax: confirmResult.pax,

        restaurantHeader: i18next.t('restaurantHeader',{ns: 'confirm', lng: lng }),
        dateHeader: i18next.t('dateHeader',{ns: 'confirm', lng: lng }),
        timeHeader: i18next.t('timeHeader',{ns: 'confirm', lng: lng }),
        restaurant: confirmResult.restaurant,
        date: confirmResult.day,
        time: confirmResult.time,
        guestsHeader: i18next.t('guestsHeader',{ns: 'confirm', lng: lng }),
        guests: confirmResult.names.split(' |-| '),
        createdAt: confirmResult.createdAt,

        paymentHeader: i18next.t('paymentHeader',{ns: 'confirm', lng: lng }),
        freeHeader: i18next.t('freeHeader',{ns: 'confirm', lng: lng }),
        paid: confirmResult.paid === 1 ? true : false,
        totalAmmount: confirmResult.totalAmmount,
        currency: confirmResult.currency,
        timeZone: `${i18next.t('timeZoneMessage',{ns: 'confirm', lng: lng })}${confirmResult.tz}`

      },(error, html)=>{if(error)throw error.toString();res.send(html)});
  }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})



const checkParamForMenu = (req: Request, res: Response, next: NextFunction):any=> {
  const { menus_id, day } = req.query;
  if (!menus_id || !day) return notFound(req, res);
  next(); 
};

reservation.get('/menu', checkParamForMenu, async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
      let lng:string = getLanguage(req);
      const { menus_id, day } = req.query;
      let rows = await executeQuery('CALL get_menu(?, ?, ?)',[lng, req.session.data?.companyID, menus_id]);
      return res.render('routes/menu',{ 
          data: (rows as any)
      },(error, html)=>{if(error)throw error.toString();res.send(html)});
  }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

export default reservation;