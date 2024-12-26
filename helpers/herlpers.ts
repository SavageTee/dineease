import newLog from "../providers/logger/logger"
import {Response, Request,} from "express"
import i18next from "../providers/i18n/i18n"


export const logErrorAndRespond = async (message: string, metadata: any, req: Request, res: Response) => {
    let generatedUUID = await newLog({
        level: 'error',
        message: message,
        metadata: metadata
    });
    res.status(500).jsonp({
        status: 'error',
        origin: 'server',
        errorText: i18next.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID })
    });
};