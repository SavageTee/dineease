import newLog from "../providers/logger/logger"
import {Response, Request,} from "express"
import i18next from "../providers/i18n/i18n"

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

export const errorPage = async (req:Request, res:Response, title:string, errorHeader:string, errorBody:string, copyError?:string, goBack?:string, showErrorScript?:boolean, companyUUID?:string ) => res.render('error/index',{
    title: title,
    errorHeader: errorHeader,
    errorBody: errorBody,
    showErrorScript: showErrorScript || false,
    copyError: copyError || "COPY ERROR",
    goBack: goBack || "GO BACK",
    companyUUID: companyUUID || ""
})

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