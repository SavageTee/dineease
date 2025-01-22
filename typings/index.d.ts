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
        capacity:number,
        reservation_by_room: boolean;
    }

    type confirm = {
        roomNumber: string,
        pax: string,
        hotelName:string;
        names: string,
        restaurant: string,
        day:string,
        time: string;
        createdAt: string;
        paid: number;
        totalAmmount: string;
        price:string,
        currency:string,
        companyName:string,
        logo:any|undefined,
    }



}

declare module 'express-session' {
    interface SessionData {
        data?: {
            companyUUID?: string;
            companyID?: string;
            reservation_by_room?:boolean;
            guest_reservation_id?:string;
            hotelID?: string;
            roomNumber?:string; 
            restaurantID?:string;
            paid?:boolean;
            verification?:string;
            qrCode?:string;
            [key: string]: any; 
        };
    }
}

