import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../../providers/i18n/i18n"
import {pool} from "../../providers/mysqlProvider/mysqlProvider"
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
    const [rows] = await pool.promise().query('CALL check_room(?, ?, ?)',[req.body.roomNumber, req.session.data?.hotelID ,req.session.data?.companyID,]);  
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
    const [rows] = await pool.promise().query('CALL verify_room(?, ?, ?, ?)',[req.session.data?.roomNumber, req.session.data?.hotelID , req.body.date  ,req.session.data?.companyID,]);  
    if((rows as any)[0][0] !== undefined){
      if(Number((rows as any)[0][0]) == 0){
          req.session.data!.paid = true;
      }else{
          req.session.data!.paid = false;
      }
    }
    return res.status(200).jsonp({
      status: 'success',
      result: (rows as any)[0][0],
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
    const [rows] = await pool.promise().query('CALL get_pdf(?)',[req.body.restaurantID]);
    res.status(200).jsonp({
      status: "success",
      menu: (rows as any)[0][0] 
    })  
  }catch(error){
    logErrorAndRespond("error occured in catch block of api.post('/menu', (req,res)=>{})", {script: "api.ts", scope: "api.post('/menu', (req,res)=>{})", request: req, error:`${error}`}, req, res );
  }
})

export default api;