"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const i18n_1 = __importDefault(require("../providers/i18n/i18n"));
const mysqlProvider_1 = require("../providers/mysqlProvider/mysqlProvider");
const herlpers_1 = require("../helpers/herlpers");
const reservation = express.Router();
const checkIdParam = (req, res, next) => {
    const { id } = req.query;
    if (!id)
        return (0, herlpers_1.notFound)(req, res);
    if (!req.session.data)
        req.session.data = {};
    req.session.data.companyUUID = id.toString();
    next();
};
reservation.get('/', checkIdParam, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    return res.render('index', { title: i18n_1.default.t('title', { ns: 'language', lng: req.language }), });
}));
reservation.get('/language', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_company(?)', [(_a = req.session.data) === null || _a === void 0 ? void 0 : _a.companyUUID]);
        if (rows[0][0] === undefined || rows[0][0] === null)
            return (0, herlpers_1.notFound)(req, res);
        let companyInfo = {
            companyID: rows[0][0]['company_id'].toString(),
            companyName: rows[0][0]['company_name'],
            companyLogo: rows[0][0]['logo'],
        };
        req.session.data.companyID = companyInfo.companyID;
        return res.render('routes/language', {
            companyID: companyInfo.companyID,
            companyName: companyInfo.companyName,
            companyLogo: `data:image/jpeg;base64,${Buffer.from(companyInfo.companyLogo, 'utf-8').toString('base64')}`,
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        return (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of language.get('/', checkIdParam, (req,res)=>{})", { script: "language.ts", scope: "language.get('/', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
reservation.get('/hotel', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_hotels(?)', [req.session.data.companyID]);
        //if((rows as any)[0][0] === undefined || (rows as any)[0][0] === null ) return errorPage(req, res, i18next.t('titleNoHotel',{ns: 'hotel', lng: req.language }), i18next.t('errorHeaderNoHotel',{ns: 'hotel', lng: req.language }), i18next.t('errorBodyNoHotel',{ns: 'hotel', lng: req.language }));
        const hotels = rows[0].map((row) => {
            var _a;
            return ({
                hotelID: row['hotel_id'].toString(),
                name: row['name'],
                logo: row['logo'] ? `data:image/jpeg;base64,${Buffer.from(row['logo'], 'utf-8').toString('base64')}` : null,
                verificationType: row['verification_type'],
                isSelected: row['hotel_id'].toString() === ((_a = req.session.data) === null || _a === void 0 ? void 0 : _a.hotelID)
            });
        });
        return res.render('routes/hotel', {
            alertText: i18n_1.default.t('alertText', { ns: 'hotel', lng: req.language }),
            buttonText: i18n_1.default.t('buttonText', { ns: 'hotel', lng: req.language }),
            hotels: hotels,
            error: i18n_1.default.t('noHotelSelectedError', { ns: 'hotel', lng: req.language }),
            buttonTextExit: i18n_1.default.t('buttonTextExit', { ns: 'hotel', lng: req.language }),
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of reservation.get('/hotel', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/hotel', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
reservation.get('/room', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.render('routes/room', {
            title: i18n_1.default.t('title', { ns: 'room', lng: req.language }),
            alertText: i18n_1.default.t('alertText', { ns: 'room', lng: req.language }),
            buttonText: i18n_1.default.t('buttonText', { ns: 'room', lng: req.language }),
            error: i18n_1.default.t('noHotelSelectedError', { ns: 'room', lng: req.language }),
            confirmButton: i18n_1.default.t('confirmButton', { ns: 'room', lng: req.language }),
            buttonTextExit: i18n_1.default.t('buttonTextExit', { ns: 'room', lng: req.language }),
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of reservation.get('/room', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/room', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
reservation.get('/restaurant', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_restaurants(?)', [req.session.data.companyID]);
        const restaurants = rows[0].map((row) => {
            var _a;
            return ({
                restaurantID: row['restaurants_id'].toString(),
                name: row['name'].toString(),
                country: row['country'].toString(),
                photo: row['photo'] ? `data:image/jpeg;base64,${Buffer.from(row['photo'], 'utf-8').toString('base64')}` : null,
                about: row['about'].toString(),
                capacity: Number(row['capacity']),
                isSelected: row['restaurants_id'].toString() === ((_a = req.session.data) === null || _a === void 0 ? void 0 : _a.restaurantID),
                reservation_by_room: rows[0][0]['reservation_by_room'] === 1 ? true : false,
            });
        });
        return res.render('routes/restaurant', {
            title: i18n_1.default.t('title', { ns: 'restaurant', lng: req.language }),
            alertText: i18n_1.default.t('alertText', { ns: 'restaurant', lng: req.language }),
            buttonText: i18n_1.default.t('buttonText', { ns: 'restaurant', lng: req.language }),
            error: i18n_1.default.t('noSelectedRestaurant', { ns: 'restaurant', lng: req.language }),
            buttonTextExit: i18n_1.default.t('buttonTextExit', { ns: 'restaurant', lng: req.language }),
            restaurants: restaurants,
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
reservation.get('/time', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const rows_names = yield (0, mysqlProvider_1.executeQuery)('CALL get_names(?)', [req.session.data.guest_reservation_id]);
        if (rows_names[0][0] != undefined) {
            let names = rows_names[0][0]['names'].split(' |-| ');
            const rows_arrival_departure = yield (0, mysqlProvider_1.executeQuery)('CALL get_pick_dates(?, ?, ?)', [req.session.data.guest_reservation_id, (_a = req.session.data) === null || _a === void 0 ? void 0 : _a.hotelID, (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.companyID]);
            let dates = rows_arrival_departure[0][0];
            const start_date = new Date(dates['start_date']);
            const end_date = new Date(dates['end_date']);
            if (start_date > end_date) {
                return (0, herlpers_1.errorPage)(req, res, i18n_1.default.t('errorDepartureHead', { ns: 'time', lng: req.language }), i18n_1.default.t('errorDepartureHead', { ns: 'time', lng: req.language }), i18n_1.default.t('errorDepartureBody', { ns: 'time', lng: req.language }), i18n_1.default.t('copyError', { ns: 'time', lng: req.language }), i18n_1.default.t('goBack', { ns: 'time', lng: req.language }), true);
            }
            else {
                return res.render('routes/time', {
                    title: i18n_1.default.t('title', { ns: 'time', lng: req.language }),
                    alertText: i18n_1.default.t('alertText', { ns: 'time', lng: req.language }),
                    buttonText: i18n_1.default.t('buttonText', { ns: 'time', lng: req.language }),
                    error: i18n_1.default.t('noSelectedRestaurant', { ns: 'time', lng: req.language }),
                    buttonTextExit: i18n_1.default.t('buttonTextExit', { ns: 'time', lng: req.language }),
                    names: names,
                    startDate: dates['start_date'],
                    endDate: dates['end_date'],
                    reservation_by_room: (_c = req.session.data) === null || _c === void 0 ? void 0 : _c.reservation_by_room,
                    paid: (_d = req.session.data) === null || _d === void 0 ? void 0 : _d.paid,
                    tableHeader: i18n_1.default.t('tableHeader', { ns: 'time', lng: req.language }),
                    roomNumber: req.session.data.roomNumber,
                    RoomBasedReservation: i18n_1.default.t('RoomBasedReservation', { ns: 'time', lng: req.language }),
                    paxBasedReservation: i18n_1.default.t('paxBasedReservation', { ns: 'time', lng: req.language }),
                    selectYourDate: i18n_1.default.t('selectYourDate', { ns: 'time', lng: req.language }),
                }, (error, html) => { if (error)
                    throw error.toString(); res.send(html); });
            }
        }
        else {
            throw Error("if stetemnt did not find any names in api if((rows_names as any)[0][0] != undefined){}");
        }
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
reservation.get('/confirm', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_confirm_qr(?)', [(_a = req.session.data) === null || _a === void 0 ? void 0 : _a.qrCode]);
        if (rows[0][0] === undefined || rows[0][0] === null)
            return (0, herlpers_1.notFound)(req, res);
        let confirmResult = {
            roomNumber: rows[0][0]['room_number'],
            pax: rows[0][0]['pax'],
            hotelName: rows[0][0]['name'],
            names: rows[0][0]['names'],
            restaurant: rows[0][0]['restaurant'],
            day: rows[0][0]['day'],
            time: rows[0][0]['time'],
            createdAt: `${rows[0][0]['created_at'].toString()} (${rows[0][0]['tz'].toString()})`,
            paid: rows[0][0]['paid'],
            totalAmmount: rows[0][0]['total_ammount'],
            price: rows[0][0]['price'],
            currency: rows[0][0]['currency'],
            companyName: rows[0][0]['company_name'],
            logo: rows[0][0]['logo'],
        };
        console.log(confirmResult);
        return res.render('routes/confirm', {
            title: i18n_1.default.t('title', { ns: 'restaurant', lng: req.language }),
            companyName: confirmResult.companyName,
            companyLogo: `data:image/jpeg;base64,${Buffer.from(confirmResult.logo, 'utf-8').toString('base64')}`,
            qrCOde: (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.qrCode,
            hotelHeader: i18n_1.default.t('hotelHeader', { ns: 'confirm', lng: req.language }),
            paxHeader: i18n_1.default.t('paxHeader', { ns: 'confirm', lng: req.language }),
            roomNumberHeader: i18n_1.default.t('roomNumberHeader', { ns: 'confirm', lng: req.language }),
            hotel: confirmResult.hotelName,
            roomNumber: confirmResult.roomNumber,
            pax: confirmResult.pax,
            restaurantHeader: i18n_1.default.t('restaurantHeader', { ns: 'confirm', lng: req.language }),
            dateHeader: i18n_1.default.t('dateHeader', { ns: 'confirm', lng: req.language }),
            timeHeader: i18n_1.default.t('timeHeader', { ns: 'confirm', lng: req.language }),
            restaurant: confirmResult.restaurant,
            date: confirmResult.day,
            time: confirmResult.time,
            guestsHeader: i18n_1.default.t('guestsHeader', { ns: 'confirm', lng: req.language }),
            guests: confirmResult.names.split(' |-| '),
            createdAt: confirmResult.createdAt,
            paymentHeader: i18n_1.default.t('paymentHeader', { ns: 'confirm', lng: req.language }),
            freeHeader: i18n_1.default.t('freeHeader', { ns: 'confirm', lng: req.language }),
            paid: confirmResult.paid === 1 ? true : false,
            totalAmmount: confirmResult.totalAmmount,
            currency: confirmResult.currency,
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
exports.default = reservation;
