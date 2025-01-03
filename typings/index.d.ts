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

    type hotel = {
        hotelID: string,
        name: string,
        logo: any | undefined,
        verfificationType: number
    }

    type restaurant = {
        restaurantID: string,
        name: string,
        country:string;
        photo: any | undefined,
        about: string,
        capacity:number
    }

}

declare module 'express-session' {
    interface SessionData {
        data?: {
            companyUUID?: string;
            companyID?: string;
            hotelID?: string;
            roomNumber?:string; 
            paid?:boolean
            [key: string]: any; 
        };
    }
}

