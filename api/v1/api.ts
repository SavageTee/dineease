import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../../providers/i18n/i18n"
import {executeQuery} from "../../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, errorPage } from "../../helpers/herlpers"

const api = express.Router()
api.use(express.json({limit: '1mb'}))

api.post('/savehotel', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if((req.headers['content-type'] != "application/json")) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    if(Object.keys(req.body).length != 1) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" }); };  
    if(Object.keys(req.body)[0] != "hotelID") {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    req.session.data!.hotelID = req.body.hotelID;
    return res.status(200).jsonp({status: 'success'})
  }catch(error){
    logErrorAndRespond("error occured in catch block of api.post('/savehotel', (req,res)=>{})", {script: "api.ts", scope: "api.post('/savehotel', (req,res)=>{})", request: req, error:`${error}`}, req, res );
  }
})

api.post('/checkroom', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if((req.headers['content-type'] != "application/json")) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    if(Object.keys(req.body).length != 1) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" }); };  
    if(Object.keys(req.body)[0] != "roomNumber") {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    const rows = await executeQuery('CALL check_room(?, ?, ?)',[req.body.roomNumber, req.session.data?.hotelID ,req.session.data?.companyID,]);  
    if((rows as any)[0][0]){
      req.session.data!.roomNumber = req.body.roomNumber;
      return res.status(200).jsonp({
        status: 'success',
        result: (rows as any)[0][0],
        verification: {
          verificationBD: i18next.t('verificationBD',{ns: 'room', lng: req.language }),
          verificationDD: i18next.t('verificationDD',{ns: 'room', lng: req.language }),
        },
      })
    }else{
      return res.status(200).jsonp({status: 'noRoom', errorText: i18next.t('invalidRoom',{ns: 'room', lng: req.language }) })
    }
  }catch(error){
    logErrorAndRespond("error occured in catch block of api.post('/checkroom', (req,res)=>{})", {script: "api.ts", scope: "api.post('/checkroom', (req,res)=>{})", request: req, error:`${error}`}, req, res );
  }
})

api.post('/verifyroom', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if((req.headers['content-type'] != "application/json")) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    if(Object.keys(req.body).length != 1) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" }); };  
    if(Object.keys(req.body)[0] != "date") {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    const rows = await executeQuery('CALL verify_room(?, ?, ?, ?)',[req.session.data?.roomNumber, req.session.data?.hotelID , req.body.date  ,req.session.data?.companyID,]);  
    if((rows as any)[0][0] !== undefined){
      if(Number((rows as any)[0][0]['remaining']) == 0){
          req.session.data!.paid = true;
      }else{
          req.session.data!.paid = false;
      }
    }
    req.session.data!.guest_reservation_id = (rows as any)[0][0]['guest_reservations_id'];
    return res.status(200).jsonp({
      status: 'success',
      result: (rows as any)[0][0]['remaining'],
      transelations:{
        freeReservation: i18next.t('freeReservation',{ns: 'room', lng: req.language }),
        paidReservation: i18next.t('paidReservation',{ns: 'room', lng: req.language }),
        remainingReservations: i18next.t('remainingReservations',{ns: 'room', lng: req.language }),
        pressContinue: i18next.t('pressContinue',{ns: 'room', lng: req.language }),
      }
    })
  }catch(error){
    logErrorAndRespond("error occured in catch block of api.post('/verifyroom', (req,res)=>{})", {script: "api.ts", scope: "api.post('/verifyroom', (req,res)=>{})", request: req, error:`${error}`}, req, res );
  }
})

api.get('/cancelreservation',async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let apiUrl = req.session.data?.companyID === undefined ? '' : req.session.data?.companyUUID;
    req.session.destroy((err) =>{});
    return res.redirect(`/en/language?id=${apiUrl}`)
  }catch(error){
    logErrorAndRespond("error occured in catch block of api.post('/cancelreservation', (req,res)=>{})", {script: "api.ts", scope: "api.post('/cancelreservation', (req,res)=>{})", request: req, error:`${error}`}, req, res );
  }
})

api.post('/menu', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if((req.headers['content-type'] != "application/json")) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    if(Object.keys(req.body).length != 1) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};  
    if(Object.keys(req.body)[0] != "restaurantID") {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
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
    if((req.headers['content-type'] != "application/json")) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    if(Object.keys(req.body).length != 1) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" }); };  
    if(Object.keys(req.body)[0] != "restaurantID") {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    const rows = await executeQuery('CALL get_by_room_flag(?)',[req.body.restaurantID]);
    if(![0, 1].includes((rows as any)[0][0]['reservation_by_room'])) return logErrorAndRespond("error occured in api.post('/saverestaurant', (req,res)=>{})", {script: "api.ts", scope: "api.post('/saverestaurant', (req,res)=>{})", request: req, error:`THE get_by_room_flag returned null value or undefined`}, req, res );
    req.session.data!.restaurantID = req.body.restaurantID;
    req.session.data!.reservation_by_room = (rows as any)[0][0]['reservation_by_room'] === 1 ? true : false;
    return res.status(200).jsonp({status: 'success'})
  }catch(error){
    logErrorAndRespond("error occured in catch block of api.post('/saverestaurant', (req,res)=>{})", {script: "api.ts", scope: "api.post('/saverestaurant', (req,res)=>{})", request: req, error:`${error}`}, req, res );
  }
})

api.post('/getavailabledate', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if((req.headers['content-type'] != "application/json")) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    if(Object.keys(req.body).length != 1) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" }); };  
    if(Object.keys(req.body)[0] != "desiredDate") {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    const rows = await executeQuery('CALL get_available_date(?, ?, ?, ?)',[req.session.data?.restaurantID, req.session.data?.hotelID, req.body.desiredDate, req.session.data?.companyID]);
    console.log((rows as any)[0])
    return res.status(200).jsonp({
      status: 'success',
      data: (rows as any)[0],
      free: i18next.t('freeText',{ns: 'time', lng: req.language }),
      errorRestaurantNotAvailable: i18next.t('errorRestaurantNotAvailable',{ns: 'time', lng: req.language }),
      table: {
        price: i18next.t('priceTable',{ns: 'time', lng: req.language }),
        time: i18next.t('timeTable',{ns: 'time', lng: req.language }),
        per_person: i18next.t('tablePerPerson',{ns: 'time', lng: req.language }),
        remaining: i18next.t('tableRemaining',{ns: 'time', lng: req.language }),
        free: i18next.t('priceTable',{ns: 'time', lng: req.language }),
      } 
    })
  }catch(error){
    logErrorAndRespond("error occured in catch block of api.post('/getavailabledate', (req,res)=>{})", {script: "api.ts", scope: "api.post('/getavailabledate', (req,res)=>{})", request: req, error:`${error}`}, req, res );
  }
})

export default api;