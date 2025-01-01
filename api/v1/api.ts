import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../../providers/i18n/i18n"
import {pool} from "../../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, errorPage } from "../../helpers/herlpers"

const api = express.Router()
api.use(express.json({limit: '1mb'}))

api.post('/savehotel', express.json(), async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
    try{
      if((req.headers['content-type'] != "application/json")) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
      if(Object.keys(req.body).length != 1) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" }); };  
      if(Object.keys(req.body)[0] != "hotelID") {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
      req.session.data!.hotelID = req.body.hotelID;
      return res.status(200).jsonp({status: 'success'})
    }catch(error){
      logErrorAndRespond("error occured in catch block of reservation.post('/savehotel', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.post('/savehotel', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res ); return notFound(req,res)
    }
})

api.post('/checkroom', express.json(), async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if((req.headers['content-type'] != "application/json")) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    if(Object.keys(req.body).length != 1) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" }); };  
    if(Object.keys(req.body)[0] != "roomNumber") {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    const [rows] = await pool.promise().query('CALL check_room(?, ?, ?)',[req.body.roomNumber, req.session.data?.hotelID ,req.session.data?.companyID,]);  
    return res.status(200).jsonp({
      status: 'success',
      result: rows,
      verification: {
        verificationBD: i18next.t('verificationBD',{ns: 'room', lng: req.language }),
        verificationDD: i18next.t('verificationDD',{ns: 'room', lng: req.language }),
      },
    })
  }catch(error){
    logErrorAndRespond("error occured in catch block of reservation.post('/savehotel', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.post('/savehotel', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );

  }
})

api.post('/verifyroom', express.json(), async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    if((req.headers['content-type'] != "application/json")) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    if(Object.keys(req.body).length != 1) {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" }); };  
    if(Object.keys(req.body)[0] != "roomNumber") {return res.status(400).jsonp({ status: 'error' ,orign: 'server', errorText: "Bad Request" });};
    const [rows] = await pool.promise().query('CALL check_room(?, ?, ?)',[req.body.roomNumber, req.session.data?.hotelID ,req.session.data?.companyID,]);  
    return res.status(200).jsonp({
      status: 'success',
      result: rows,
      verification: {
        verificationBD: i18next.t('verificationBD',{ns: 'room', lng: req.language }),
        verificationDD: i18next.t('verificationDD',{ns: 'room', lng: req.language }),
      },
    })
  }catch(error){
    logErrorAndRespond("error occured in catch block of reservation.post('/savehotel', checkIdParam, (req,res)=>{})", {script: "reservation.ts", scope: "reservation.post('/savehotel', checkIdParam, (req,res)=>{})", request: req, error:`${error}`}, req, res );

  }
})




export default api;