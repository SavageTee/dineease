import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../../providers/i18n/i18n"
import {executeQuery} from "../../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, errorPage, validateContentType, validateRequestBodyKeys, reportErrorAndRespond, ReportErrorAndRespondJsonGet } from "../../helpers/herlpers"

const api = express.Router()
api.use(express.json({limit: '1mb'}))


api.post('/report', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if (!validateContentType(req, res)) return;
    if (!validateRequestBodyKeys(req, res, ["error"])) return;
    reportErrorAndRespond("USER ERROR REPORT INSIDE api.post('/report', (req,res)=>{})", {script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error:`${req.body.error}`},req,res);
  }catch(error){
    logErrorAndRespond("USER ERROR REPORT INSIDE CATCH api.post('/report', (req,res)=>{})", {script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error:`${error}`},req,res);
  }
})


api.get('/state', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let data = req.session.data!;

    console.log(data)
    const states = [
      { state: 'language', keys: ['companyUUID'] },
      { state: 'language', keys: ['companyUUID', 'companyID'] },
      { state: 'room', keys: ['companyUUID', 'companyID', 'hotelID'] },
      { state: 'room', keys: ['companyUUID', 'companyID', 'hotelID', 'roomNumber'] },
      { state: 'room', keys: ['companyUUID', 'companyID', 'hotelID', 'roomNumber', 'guest_reservation_id'] },
      { state: 'room', keys: ['companyUUID', 'companyID', 'hotelID', 'roomNumber', 'guest_reservation_id', 'verification'] },
      { state: 'room', keys: ['companyUUID', 'companyID', 'hotelID', 'roomNumber', 'guest_reservation_id', 'verification', 'paid'] },
    ];
    const matchedState = states.find(({ keys }) =>
      keys.every(key => key in data && data[key] !== undefined && data[key] !== null) &&
      Object.keys(data).length === keys.length
    );
    if (matchedState) {
      const keysToRemove = ['roomNumber', 'guest_reservation_id', 'verification', 'paid'];
      keysToRemove.forEach(key => {
        if (matchedState.keys.includes(key)) {
          delete data[key];
        }
      });
      return res.status(200).jsonp({ state: matchedState.state });
    }
    if(true)return res.status(200).jsonp({ state: 'qrcode'});
  }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of api.get('/state')", {script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error:`${error}`},req,res)}
})

api.post('/savehotel', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if (!validateContentType(req, res)) return;
    if (!validateRequestBodyKeys(req, res, ["hotelID"])) return;
    req.session.data!.hotelID = req.body.hotelID;
    return res.status(200).jsonp({status: 'success'})
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/savehotel', (req,res)=>{})", {script: "api.ts", scope: "api.post('/savehotel', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

export const checkRoom = async (req:Request, res:Response):Promise<any> => {
  const rows = await executeQuery('CALL check_room(?, ?, ?)',[req.body.roomNumber, req.session.data?.hotelID ,req.session.data?.companyID,]);
  if(!(rows as any)[0][0]) { 
    res.status(200).jsonp({status: 'noRoom', errorText: i18next.t('invalidRoom',{ns: 'room', lng: req.language }) });
    return false;
  }else{ return (rows as any)[0][0];}
}

api.post('/checkroom', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if (!validateContentType(req, res)) return;
    if (!validateRequestBodyKeys(req, res, ["roomNumber"])) return;
    let checkResult = await checkRoom(req, res); if(!checkResult) return;
    req.session.data!.roomNumber = req.body.roomNumber;
    return res.status(200).jsonp({
      status: 'success',
      result: checkResult,
      verification: {
        verificationBD: i18next.t('verificationBD',{ns: 'room', lng: req.language }),
        verificationDD: i18next.t('verificationDD',{ns: 'room', lng: req.language }),
      },
    })
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/checkroom', (req,res)=>{})", {script: "api.ts", scope: "api.post('/checkroom', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})


export const verifyRoom = async (req:Request, res:Response):Promise<any> => {
  const rows = await executeQuery('CALL verify_room(?, ?, ?, ?)',[req.session.data?.roomNumber, req.session.data?.hotelID , req.body.date  ,req.session.data?.companyID,]);  
  return (rows as any)[0][0]
}

api.post('/verifyroom', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if (!validateContentType(req, res)) return;
    if (!validateRequestBodyKeys(req, res, ["date"])) return;
    let result = await verifyRoom(req,res);
    if( result['result'] && result['result'] === 'noReservation') return res.status(200).jsonp({ status: 'error', errorText: i18next.t('invalidRoom',{ns: 'room', lng: req.language }) })
    if( result['result'] && result['result'] === 'wrongDate') return res.status(200).jsonp({ status: 'error', errorText: i18next.t('wrongDate',{ns: 'room', lng: req.language }) })
    if(Number(result['remaining']) <= 0){req.session.data!.paid = true;}else{req.session.data!.paid = false;}
    req.session.data!.guest_reservation_id = result['guest_reservations_id'];
    req.session.data!.verification = req.body.date;
    return res.status(200).jsonp({
      status: 'success',
      result: result['remaining'],
      transelations:{
        freeReservation: i18next.t('freeReservation',{ns: 'room', lng: req.language }),
        paidReservation: i18next.t('paidReservation',{ns: 'room', lng: req.language }),
        remainingReservations: i18next.t('remainingReservations',{ns: 'room', lng: req.language }),
        pressContinue: i18next.t('pressContinue',{ns: 'room', lng: req.language }),
      }
    })
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/verifyroom', (req,res)=>{})", {script: "api.ts", scope: "api.post('/verifyroom', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})


function handleCancel(req:Request, res:Response){
    let apiUrl = req.session.data?.companyUUID === undefined ? '' : req.session.data?.companyUUID;
    req.session.destroy((_) =>{});
    return res.redirect(`/en/reservation?id=${apiUrl}`)
}

api.get('/cancelreservation',async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    handleCancel(req, res)
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/cancelreservation', (req,res)=>{})", {script: "api.ts", scope: "api.post('/cancelreservation', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

api.post('/menu', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if (!validateContentType(req, res)) return;
    if (!validateRequestBodyKeys(req, res, ["restaurantID"])) return;
    const rows = await executeQuery('CALL get_pdf(?)',[req.body.restaurantID]);
    res.status(200).jsonp({
      status: "success",
      menu: (rows as any)[0][0] 
    })  
  }catch(error){
    logErrorAndRespond("error occured in catch block of api.post('/menu', (req,res)=>{})", {script: "api.ts", scope: "api.post('/menu', (req,res)=>{})", request: req, error:`${error}`}, req, res );
  }
})

api.post('/saverestaurant', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if (!validateContentType(req, res)) return;
    if (!validateRequestBodyKeys(req, res, ["restaurantID"])) return;
    const rows = await executeQuery('CALL get_by_room_flag(?)',[req.body.restaurantID]);
    if(![0, 1].includes((rows as any)[0][0]['reservation_by_room'])) return logErrorAndRespond("error occured in api.post('/saverestaurant', (req,res)=>{})", {script: "api.ts", scope: "api.post('/saverestaurant', (req,res)=>{})", request: req, error:`THE get_by_room_flag returned null value or undefined`}, req, res );
    req.session.data!.restaurantID = req.body.restaurantID;
    req.session.data!.reservation_by_room = (rows as any)[0][0]['reservation_by_room'] === 1 ? true : false;
    return res.status(200).jsonp({status: 'success'})
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/saverestaurant', (req,res)=>{})", {script: "api.ts", scope: "api.post('/saverestaurant', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

api.post('/getavailabledate', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if (!validateContentType(req, res)) return;
    if (!validateRequestBodyKeys(req, res, ["desiredDate"])) return;
    const rows = await executeQuery('CALL get_available_date(?, ?, ?, ?)',[req.session.data?.restaurantID, req.session.data?.hotelID, req.body.desiredDate, req.session.data?.companyID]);
    console.log((rows as any)[0])
    return res.status(200).jsonp({
      status: 'success',
      data: (rows as any)[0],
      free: i18next.t('freeText',{ns: 'time', lng: req.language }),
      errorRestaurantNotAvailable: i18next.t('errorRestaurantNotAvailable',{ns: 'time', lng: req.language }),
      noSelectedGuestsError: i18next.t('noSelectedGuestsError',{ns: 'time', lng: req.language }),
      noSelectedTimeError: i18next.t('noSelectedTimeError',{ns: 'time', lng: req.language }),
      table: {
        price: i18next.t('priceTable',{ns: 'time', lng: req.language }),
        time: i18next.t('timeTable',{ns: 'time', lng: req.language }),
        per_person: i18next.t('tablePerPerson',{ns: 'time', lng: req.language }),
        remaining: i18next.t('tableRemaining',{ns: 'time', lng: req.language }),
        free: i18next.t('priceTable',{ns: 'time', lng: req.language }),
        meal_type: JSON.stringify(i18next.t('mealType',{ns: 'time', lng:req.language,returnObjects: true })),
      } 
    })
  }catch(error){
    logErrorAndRespond("error occured in catch block of api.post('/getavailabledate', (req,res)=>{})", {script: "api.ts", scope: "api.post('/getavailabledate', (req,res)=>{})", request: req, error:`${error}`}, req, res );
  }
})



api.post('/validate', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if (!validateContentType(req, res)) return;
    if (!validateRequestBodyKeys(req, res, ["selectedTime", "selectedNames", "desiredDate"])) return;
    const rows_check_room = await executeQuery('CALL check_room(?, ?, ?)',[req.session.data?.roomNumber, req.session.data?.hotelID  ,req.session.data?.companyID,]);  
    if(!(rows_check_room as any)[0][0]) return res.status(202).jsonp( { status: "error" } )
    const rows_verify_room = await executeQuery('CALL verify_room(?, ?, ?, ?)',[ req.session.data?.roomNumber, req.session.data?.hotelID, req.session.data?.verification, req.session.data?.companyID,]);  
    if((rows_verify_room as any)[0][0] !== undefined && (rows_verify_room as any)[0][0]['remaining'] !== undefined){
      if(Number((rows_verify_room as any)[0][0]['remaining']) == 0){
        req.session.data!.paid = true;
      }else{
        req.session.data!.paid = false;
      }
    }else{ return res.status(202).jsonp( { status: "error" } ) }
    req.session.data!.guest_reservation_id = (rows_verify_room as any)[0][0]['guest_reservations_id'];
    const rows_get_room = await executeQuery('CALL get_by_room_flag(?)',[req.session.data?.restaurantID]);
    if(![0, 1].includes((rows_get_room as any)[0][0]['reservation_by_room'])) return res.status(202).jsonp( { status: "error" } ) ;
    req.session.data!.reservation_by_room = (rows_get_room as any)[0][0]['reservation_by_room'] === 1 ? true : false;
    const rows_get_available_dates = await executeQuery('CALL get_available_date(?, ?, ?, ?)',[req.session.data?.restaurantID, req.session.data?.hotelID, req.body.desiredDate, req.session.data?.companyID]);
    let userSelect = ((rows_get_available_dates as any)[0]).find((time:any) => time['restaurant_pricing_times_id'] === req.body.selectedTime) 
    if(userSelect === undefined || userSelect === null) return res.status(202).jsonp( { status: "error" } );
    if(req.session.data?.reservation_by_room){
      if(userSelect['remaining'] <= 0) return res.status(200).jsonp( { status: "notEnough" , errorText: i18next.t('notEnough',{ns: 'time', lng: req.language }),});
    }else{
      if(req.body.selectedNames.length > userSelect['remaining']) return res.status(200).jsonp( { status: "notEnough" , errorText: i18next.t('notEnough',{ns: 'time', lng: req.language }),});
    }
    let totalAmount = 0;
    if(req.session.data?.paid){
      if(userSelect['per_person'] === 1){
        totalAmount = Number(req.body.selectedNames.length) * Number(userSelect['price']);
        console.log(totalAmount)
      }else{
        totalAmount = Number(((rows_get_available_dates as any)[0])['price'])
      }
    }
    const insert = await executeQuery('CALL create_reservation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.session.data!.guest_reservation_id,
        req.session.data?.roomNumber,
        req.body.selectedNames.length,
        req.body.selectedNames.join(' |-| '),
        req.session.data?.restaurantID,
        req.body.desiredDate,
        userSelect['time'],
        req.session.data?.companyID,
        req.session.data?.hotelID,
        'USER END',
        userSelect['currencies_id'],
        req.session.data?.paid ? userSelect['price'] : null,
        req.session.data?.paid ? totalAmount : null,
        req.session.data?.paid ? userSelect['exchange_rate'] : null,
        req.session.data?.paid 
      ]
    );
    console.log((insert as any))
    if((insert as any)[0][0]['result'] === "alreadyReserved") return res.status(200).jsonp({ status: "alreadyReserved", errorText:  i18next.t('alreadyReserved',{ns: 'time', lng: req.language })})
    req.session.data!.qrCode = (insert as any)[0][0]['result'];
    return res.status(200).jsonp({ status: "success" })
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/validate', (req,res)=>{})", {script: "api.ts", scope: "api.post('/validate', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

export default api;