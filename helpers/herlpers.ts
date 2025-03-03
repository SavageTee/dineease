import newLog from "../providers/logger/logger"
import {Response, Request,NextFunction} from "express"
import i18next, {locales} from "../providers/i18n/i18n"
import * as Joi from "joi"
import fs from "fs"
import path from "path"

export const getLanguage = (req: Request) => { 
    if( req.headers['accept-language'] && req.headers['accept-language'].split(',')[0].split('-')[0] && locales.includes(req.headers['accept-language'].split(',')[0].split('-')[0]) ){
        i18next.changeLanguage(req.headers['accept-language'].split(',')[0].split('-')[0]);
        return req.headers['accept-language'].split(',')[0].split('-')[0]
    }else{
        i18next.changeLanguage('en');
        return 'en';
    }
}

export const convertFileToBase64 = (imagePath:string):string | false => {
    try{
        const fullPath = path.join(__dirname, '..', imagePath);   
        const fileBuffer = fs.readFileSync(fullPath);
        const base64File = fileBuffer.toString('base64');
        const extname = path.extname(imagePath).toLowerCase();
        let mimeType = '';
        switch (extname) {
            case '.jpg':
            case '.jpeg':
                mimeType = 'image/jpeg';
                break;
            case '.png':
                mimeType = 'image/png';
                break;
            case '.gif':
                mimeType = 'image/gif';
                break;
            case '.pdf':
                mimeType = 'application/pdf';
                break;    
            default:
                return false;
        }
        return `data:${mimeType};base64,${base64File}`;
    }catch(error){return false;}
}

export const validateContentType = (req: Request, res: Response) => {
    if (req.headers['content-type'] !== "application/json") {
        res.status(400).jsonp({ status: 'error', origin: 'server', errorText: "Bad Request" });
        return false;
    }
    return true;
};

export const validateRequestBodyKeys = (req: Request, res: Response,expectedKeys:string[]) => {
    if (Object.keys(req.body).length !== expectedKeys.length || !expectedKeys.every((key, index) => key === Object.keys(req.body)[index])) {
        res.status(400).jsonp({ status: 'error', origin: 'server', errorText: "Bad Request" });
        return false;
    }
    return true;
};

export const notFound = async (req:Request, res:Response) => res.render('404/index',{
    title: i18next.t('title',{ns: '404', lng: req.language }),
    errorHeader: i18next.t('errorHeader',{ns: '404', lng: req.language }),
    errorBody: i18next.t('errorBody',{ns: '404', lng: req.language }),
})

export const errorPage = (req:Request, res:Response, title:string, errorHeader:string, errorBody:string, copyError?:string, goBack?:string, showErrorScript?:boolean) =>{
    try{
        let uuid = req.session.data?.companyUUID;
        req.session.destroy(()=>{});
        return res.render('error/index',{
            title: title,
            errorHeader: errorHeader,
            errorBody: errorBody,
            showErrorScript: showErrorScript || false,
            copyError: copyError || "COPY ERROR",
            goBack: goBack || "GO BACK",
            companyUUID: uuid || ''
        },(error, html)=>{if(error)throw error.toString();res.send(html)})
    }catch(error){ ReportErrorAndRespondJsonGet("error occured in catch block of helpers functions export const errorPage()", {script: "helpers.ts", scope: "errorPage()", request: req, error:`${error}`}, req, res ); }
}

export const ReportErrorAndRespondJsonGet = async (message: string, metadata: any, req: Request, res: Response) => {
    let generatedUUID = await newLog({
        level: 'error',
        message: message,
        metadata: metadata
    });
    return res.status(500).jsonp({
        status: "error",
        errorText: i18next.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID })
    })
}

export const ReportErrorAndRespondErrorPage  = async (message: string, metadata: any, req: Request, res: Response) => {
    let generatedUUID = await newLog({
        level: 'error',
        message: message,
        metadata: metadata
    });
    return errorPage(req, res, i18next.t('error', { ns: "server", lng: req.language, UUID: generatedUUID }), i18next.t('error', { ns: "server", lng: req.language, UUID: generatedUUID}) , i18next.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID }) );
}

export const reportErrorAndRespond = async (message: string, metadata: any, req: Request, res: Response) => {
    let generatedUUID = await newLog({
        level: 'error',
        message: message,
        metadata: metadata
    });
    if(req.method === 'POST'){
        return res.status(200).jsonp({
            status: "error",
            errorText: i18next.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID })
        })
    }else{
        return errorPage(req, res, i18next.t('error', { ns: "server", lng: req.language, UUID: generatedUUID }), i18next.t('error', { ns: "server", lng: req.language, UUID: generatedUUID}) , i18next.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID }) );
    }
}

export const logErrorAndRespond = async (message: string, metadata: any, req: Request, res: Response) => {
    let generatedUUID = await newLog({
        level: 'error',
        message: message,
        metadata: metadata
    });
    if(req.method === 'POST'){
        return res.status(500).jsonp({
            status: "error",
            errorText: i18next.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID })
        })
    }else{
        return errorPage(req, res, i18next.t('error', { ns: "server", lng: req.language, UUID: generatedUUID }), i18next.t('error', { ns: "server", lng: req.language, UUID: generatedUUID}) , i18next.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID }) );
    }
};



export const goBack = (res:Response) =>{return res.send(`<script>window.history.back();</script>`);}