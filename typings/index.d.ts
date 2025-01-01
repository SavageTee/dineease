import * as express from 'express';
import * as jwt from "jsonwebtoken"
import * as i18next from 'i18next';
import session from  "express-session";

declare global {
    namespace Express{
        interface Request {
            preferredLanguage: string, 
            accessToken?:  string | jwt.JwtPayload | undefined 
        }
    }

    type companyInfo = {
        companyID: string,
        companyName: string,
        companyLogo: any | undefined
    }

    type hotels = {
        hotelID: string,
        name: string,
        logo: any | undefined,
        verfificationType: number
    }

}

declare module 'express-session' {
    interface SessionData {
        data?: {
            companyUUID?: string;
            companyID?: string;
            hotelID?: string;
            [key: string]: any; // Optional, for additional properties
        };
    }
}

