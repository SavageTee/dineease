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
        cuisine:string;
        photo: any | undefined,
        about: string,
        menu_selection:boolean;
        capacity:number,
    }

    type adminUser = {
        userName:string;
        email:string;
        phone:string;
        displayName:string;
        admin:boolean;
        createdAt:string;
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
        tz:string;
    }

    type adminPermissions = {
        hotelsTab: boolean; 
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
        },
        adminData?: {
            companyUUID?: string;
            companyID?: string;
            adminUser?: string;
            adminPermissions?: adminPermissions;
            [key: string]: any; 
        };
    }
}

