import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../../../providers/i18n/i18n"
import {executeQuery} from "../../../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, errorPage, validateContentType, validateRequestBodyKeys, reportErrorAndRespond, ReportErrorAndRespondJsonGet, getLanguage, convertFileToBase64 } from "../../../helpers/herlpers"

const api = express.Router()
api.use(express.json({limit: '1mb'}))

api.post('/report', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    if (!validateContentType(req, res, 'application/json')) return;
    if (!validateRequestBodyKeys(req, res, ["error"])) return;
    reportErrorAndRespond("USER ERROR REPORT INSIDE api.post('/report', (req,res)=>{})", {script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error:`${req.body.error}`},req,res);
  }catch(error){
    logErrorAndRespond("USER ERROR REPORT INSIDE CATCH api.post('/report', (req,res)=>{})", {script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error:`${error}`},req,res);
  }
})

api.get('/state', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    let data = req.session.data!;
    return res.status(200).jsonp({ state: 'restaurant' })
   /*const states = [
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
    if(true)return res.status(200).jsonp({ state: 'room'});*/
  }catch(error){ReportErrorAndRespondJsonGet("error occured in catch block of api.get('/state')", {script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error:`${error}`},req,res)}
})

api.post('/savehotel', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    if (!validateContentType(req, res, 'application/json')) return;
    if (!validateRequestBodyKeys(req, res, ["hotelID"])) return;
    req.session.data!.hotelID = req.body.hotelID;
    return res.status(200).jsonp({status: 'success'})
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/savehotel', (req,res)=>{})", {script: "api.ts", scope: "api.post('/savehotel', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

api.post('/menuselection', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    if (!validateContentType(req, res, 'application/json')) return;
    if (!validateRequestBodyKeys(req, res, ["restaurantID"])) return;
    const rows_dates = await executeQuery('CALL get_pick_dates(?, ?, ?)',[req.session.data!.guest_reservation_id,req.session.data?.hotelID,req.session.data?.companyID]); 
    const rows = await executeQuery('CALL get_menus_urls_or_viewer(?, ?, ?, ?, ?)',[(rows_dates as any)[0][0]['start_date'], (rows_dates as any)[0][0]['end_date'], req.body.restaurantID, req.session.data?.companyID, lng]); 
    return res.status(200).jsonp({status: 'success', data: (rows as any)[0], viewMenuTranslation: i18next.t('viewMenu',{ns: 'restaurant', lng:lng,returnObjects: true }),})
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/savehotel', (req,res)=>{})", {script: "api.ts", scope: "api.post('/savehotel', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

api.post('/menu', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    if (!validateContentType(req, res, 'application/json')) return;
    if (!validateRequestBodyKeys(req, res, ["referenceID"])) return;
    const rows = await executeQuery('CALL get_menu_pdf_url(?)',[req.body.referenceID]);
    return res.status(200).jsonp({
      status: "success",
      menu: await convertFileToBase64((rows as any)[0][0]['menu_url'].toString())
    })  
  }catch(error){
    logErrorAndRespond("error occured in catch block of api.post('/menu', (req,res)=>{})", {script: "api.ts", scope: "api.post('/menu', (req,res)=>{})", request: req, error:`${error}`}, req, res );
  }
})


const groupedData = async (rows: any[]) => {
  const data = rows[0];
  const acc: any = {};
  for (const item of data) {
    const { category_name, subcategory_name, menu_categories_background_url, menu_subcategories_background_url } = item;
    if (!acc[category_name]) {acc[category_name] = {};}
    if (!acc[category_name][subcategory_name]) {acc[category_name][subcategory_name] = [];}
    if (menu_categories_background_url) {
      try {
        const base64Image = await convertFileToBase64(menu_categories_background_url);
        item.menu_categories_background_url = base64Image;
      } catch (error) {
        console.error(`Failed to convert ${menu_categories_background_url} to Base64:`, error);
      }
    }else{  
      try {
        const base64Image = await convertFileToBase64('/media/backgrounds/default.jpg');
        item.menu_categories_background_url = base64Image;
      } catch (error) {
        console.error(`Failed to convert ${menu_categories_background_url} to Base64:`, error);
      }
    }
    if (menu_subcategories_background_url) {
      try {
        const base64Image = await convertFileToBase64(menu_subcategories_background_url);
        item.menu_subcategories_background_url = base64Image;
      } catch (error) {
        console.error(`Failed to convert ${menu_subcategories_background_url} to Base64:`, error);
      }
    }else{ 
      try {
        const base64Image = await convertFileToBase64('/media/backgrounds/default.jpg');
        item.menu_subcategories_background_url = base64Image;
      } catch (error) {
        console.error(`Failed to convert ${menu_subcategories_background_url} to Base64:`, error);
      }
     }
    acc[category_name][subcategory_name].push(item);
  }
  return acc;
};

api.post('/menuviewer', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    if (!validateContentType(req, res, 'application/json')) return;
    if (!validateRequestBodyKeys(req, res, ["referenceID"])) return;
    const rows = await executeQuery('CALL get_menu(?, ?, ?)',[lng, req.session.data?.companyID, req.body.referenceID]);
    let result = await groupedData((rows as any));
    return res.render('routes/menu',{
      menuModalTitle: i18next.t('menuModalTitle',{ns: 'restaurant', lng: lng }),
      close: i18next.t('close',{ns: 'restaurant', lng: lng }),
      groupedData: result,
      viewOnly: true
    },(error, html)=>{if(error)throw error.toString();res.send(html)});
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/savehotel', (req,res)=>{})", {script: "api.ts", scope: "api.post('/savehotel', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

export const checkRoom = async (req:Request, res:Response, lng:string):Promise<any> => {
  const rows = await executeQuery('CALL check_room(?, ?, ?)',[req.body.roomNumber, req.session.data?.hotelID ,req.session.data?.companyID,]);
  if(!(rows as any)[0][0]) { 
    res.status(200).jsonp({status: 'noRoom', errorText: i18next.t('invalidRoom',{ns: 'room', lng: lng }) });
    return false;
  }else{ return (rows as any)[0][0];}
}

api.post('/checkroom', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    if (!validateContentType(req, res, 'application/json')) return;
    if (!validateRequestBodyKeys(req, res, ["roomNumber"])) return;
    let checkResult = await checkRoom(req, res, lng); if(!checkResult) return;
    req.session.data!.roomNumber = req.body.roomNumber;
    return res.status(200).jsonp({
      status: 'success',
      result: checkResult,
      verification: {
        verificationBD: i18next.t('verificationBD',{ns: 'room', lng: lng }),
        verificationDD: i18next.t('verificationDD',{ns: 'room', lng: lng }),
      },
    })
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/checkroom', (req,res)=>{})", {script: "api.ts", scope: "api.post('/checkroom', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})


export const verifyRoom = async (req:Request, res:Response):Promise<any> => {
  const rows = await executeQuery('CALL verify_room_date(?, ?, ?, ?)',[req.session.data?.roomNumber, req.session.data?.hotelID , req.body.date  ,req.session.data?.companyID,]);  
  return (rows as any)[0][0]
}

api.post('/verifyroom', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    if (!validateContentType(req, res, 'application/json')) return;
    if (!validateRequestBodyKeys(req, res, ["date"])) return;
    let result = await verifyRoom(req,res);
    if( result['result'] && result['result'] === 'noReservation') return res.status(200).jsonp({ status: 'error', errorText: i18next.t('invalidRoom',{ns: 'room', lng: lng }) })
    if( result['result'] && result['result'] === 'wrongDate') return res.status(200).jsonp({ status: 'error', errorText: i18next.t('wrongDate',{ns: 'room', lng: lng }) })
    req.session.data!.guest_reservation_id = result['guest_reservations_id'];
    req.session.data!.verification = req.body.date;
    res.status(200).jsonp({status: 'success'})
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/verifyroom', (req,res)=>{})", {script: "api.ts", scope: "api.post('/verifyroom', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

function handleCancel(req:Request, res:Response){
    let apiUrl = req.session.data?.companyUUID === undefined ? '' : req.session.data?.companyUUID;
    req.session.destroy((_) =>{});
    return res.redirect(`/reservation?id=${apiUrl}`)
}

api.get('/cancelreservation',async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    handleCancel(req, res)
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/cancelreservation', (req,res)=>{})", {script: "api.ts", scope: "api.post('/cancelreservation', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})


export const checkPaidInfo = async (req:Request, res:Response):Promise<any> => {
  const rows = await executeQuery('CALL check_paid_info(?, ?, ?, ?, ?)',[req.session.data?.hotelID, req.session.data?.roomNumber, req.session.data?.guest_reservation_id, req.body.restaurantID, req.session.data?.companyID]);  
  return (rows as any)[0][0]
}

api.post('/saverestaurant', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    if (!validateContentType(req, res, 'application/json')) return;
    if (!validateRequestBodyKeys(req, res, ["restaurantID"])) return;
    req.session.data!.restaurantID = req.body.restaurantID;
    let result = await checkPaidInfo(req,res);
    switch (result['result']){
      case "alwaysPaid":
        res.status(200).jsonp({ "status": "success", notice: i18next.t('alwaysPaidNotice',{ns: 'restaurant', lng: lng }),pressContinue: i18next.t('pressContinue',{ns: 'restaurant', lng: lng}),})
        req.session.data!.paid = true;
        break;
      case "alwaysFree":
          res.status(200).jsonp({ "status": "success", alwaysFreeNotice: i18next.t('alwaysFreeNotice',{ns: 'restaurant', lng: lng }), pressContinue: i18next.t('pressContinue',{ns: 'restaurant', lng: lng}),})
          req.session.data!.paid = false;
          break;  
      case "restrictrd":
        res.status(202).jsonp({ "status": "error", notice: i18next.t('restrictrdNotice',{ns: 'restaurant', lng: lng }),})
        break; 
      case "crossHotelPaid":
        res.status(200).jsonp({ "status": "success", notice: i18next.t('crossHotelNotice',{ns: 'restaurant', lng: lng }), pressContinue: i18next.t('pressContinue',{ns: 'restaurant', lng: lng}),})
        req.session.data!.paid = true;
        break;  
      case "success":
        if(Number(result['remaining']) <= 0){
          req.session.data!.paid = true;
          res.status(200).jsonp({
            status: 'success', 
            paidReservation: i18next.t('paidReservation',{ns: 'restaurant', lng: lng}),
            pressContinue: i18next.t('pressContinue',{ns: 'restaurant', lng: lng}),
          })
        }else{
          req.session.data!.paid = false;
          res.status(200).jsonp({
            status: 'success', 
            freeReservation: i18next.t('freeReservation',{ns: 'restaurant', lng: lng}),
            remainingReservations: i18next.t('remainingReservations',{ns: 'restaurant', lng: lng}),
            pressContinue: i18next.t('pressContinue',{ns: 'restaurant', lng: lng}),
            remaining: result['remaining']
          })
        }
        break;  
      default:
        break;      
    }
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/saverestaurant', (req,res)=>{})", {script: "api.ts", scope: "api.post('/saverestaurant', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

api.post('/getavailabledate', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    if (!validateContentType(req, res, 'application/json')) return;
    if (!validateRequestBodyKeys(req, res, ["desiredDate"])) return;
      const rows_names =  await executeQuery('CALL get_names(?)',[req.session.data!.guest_reservation_id]); 
      if((rows_names as any)[0][0] != undefined){
          let names:string[] = (rows_names as any)[0][0]['names'].split(' |-| ');
          const rows = await executeQuery('CALL get_available_date(?, ?, ?, ?)',[req.session.data?.restaurantID, req.session.data?.hotelID, req.body.desiredDate, req.session.data?.companyID]);
          return res.status(200).jsonp({
            status: 'success',
            data: (rows as any)[0],
            free: i18next.t('freeText',{ns: 'time', lng: lng }),
            errorRestaurantNotAvailable: i18next.t('errorRestaurantNotAvailable',{ns: 'time', lng: lng }),
            noSelectedGuestsError: i18next.t('noSelectedGuestsError',{ns: 'time', lng: lng }),
            noSelectedTimeError: i18next.t('noSelectedTimeError',{ns: 'time', lng: lng }),
            RoomBasedReservation: i18next.t('RoomBasedReservation',{ns: 'time', lng: lng }),
            paxBasedReservation: i18next.t('paxBasedReservation',{ns: 'time', lng: lng }),
            roomNumber: req.session.data?.roomNumber,
            names: names,
            table: {
              price: i18next.t('priceTable',{ns: 'time', lng: lng }),
              time: i18next.t('timeTable',{ns: 'time', lng: lng }),
              per_person: i18next.t('tablePerPerson',{ns: 'time', lng: lng }),
              remaining: i18next.t('tableRemaining',{ns: 'time', lng: lng }),
              free: i18next.t('priceTable',{ns: 'time', lng: lng }),
              meal_type: JSON.stringify(i18next.t('mealType',{ns: 'time', lng:lng,returnObjects: true })),
              total: i18next.t('total',{ns: 'time', lng: lng }),
            } 
          })
    }else{throw Error("if stetemnt did not find any names in api if((rows_names as any)[0][0] != undefined){}")}  
  }catch(error){
    logErrorAndRespond("error occured in catch block of api.post('/getavailabledate', (req,res)=>{})", {script: "api.ts", scope: "api.post('/getavailabledate', (req,res)=>{})", request: req, error:`${error}`}, req, res );
  }
})



api.post('/validate', async (req:Request, res:Response, next:NextFunction):Promise<any>=>{
  try{
    let lng:string = getLanguage(req);
    if (!validateContentType(req, res, 'application/json')) return;
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
      if(userSelect['remaining'] <= 0) return res.status(200).jsonp( { status: "notEnough" , errorText: i18next.t('notEnough',{ns: 'time', lng: lng }),});
    }else{
      if(req.body.selectedNames.length > userSelect['remaining']) return res.status(200).jsonp( { status: "notEnough" , errorText: i18next.t('notEnough',{ns: 'time', lng: lng }),});
    }
    let totalAmount = 0;
    if(req.session.data?.paid){
      if(userSelect['per_person'] === 1){
        totalAmount = Number(req.body.selectedNames.length) * Number(userSelect['price']);
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
    if((insert as any)[0][0]['result'] === "alreadyReserved") return res.status(200).jsonp({ status: "alreadyReserved", errorText:  i18next.t('alreadyReserved',{ns: 'time', lng: lng })})
    req.session.data!.qrCode = (insert as any)[0][0]['result'];
    return res.status(200).jsonp({ status: "success" })
  }catch(error){logErrorAndRespond("error occured in catch block of api.post('/validate', (req,res)=>{})", {script: "api.ts", scope: "api.post('/validate', (req,res)=>{})", request: req, error:`${error}`}, req, res );}
})

export default api;