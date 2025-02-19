import newLog from "../providers/logger/logger"
import {Response, Request, NextFunction} from "express"
import Joi from "joi"
import i18next from "../providers/i18n/i18n"

export const validateContentType = (req: Request, res: Response, contentType:string) => {
    if (!req.headers['content-type']?.includes(contentType) ) {
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
        let uuid = ''; /*req.session.data?.companyUUID;*/
        console.log(uuid)
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

export const RequestLargeError = (err:any, res:Response, next:NextFunction):any => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
          status: 'error',
          errorText: 'Request Entity Too Large'
        });
    }
    next(err);
}

export const validateRequestBody = (req: Request, res: Response, generateSchema: (lng: string) => Joi.ObjectSchema<any>, language: string, body: any) => {
    const result = generateSchema(language).validate(body);
    if (result.error) {
        const uniqueErrors = result.error.details.reduce((acc: any[], current) => {
            const isDuplicate = acc.some(error => 
                //error.message === current.message && 
                JSON.stringify(error.path) === JSON.stringify(current.path)
            );
            if (!isDuplicate) {
                acc.push({ message: current.message, path: current.path });
            }
            return acc;
        }, []);
        res.status(202).json({
            status: 'error',
            origin: 'fields',
            errorText: uniqueErrors
        });
        return false;
    }
    return true;
};

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