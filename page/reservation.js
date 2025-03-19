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
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        return res.render('index', { title: i18n_1.default.t('title', { ns: 'language', lng: lng }), }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        return (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of reservation.get('/', checkIdParam, (req,res)=>{})", { script: "language.ts", scope: "reservation.get('/', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
reservation.get('/language', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_company(?)', [(_a = req.session.data) === null || _a === void 0 ? void 0 : _a.companyUUID]);
        if (rows[0][0] === undefined || rows[0][0] === null)
            return (0, herlpers_1.notFound)(req, res);
        let logo_base64 = yield (0, herlpers_1.convertFileToBase64)(rows[0][0]['logo_url']);
        let companyInfo = {
            companyID: rows[0][0]['company_id'].toString(),
            companyName: rows[0][0]['company_name'],
            companyLogo: logo_base64,
        };
        req.session.data.companyID = companyInfo.companyID;
        return res.render('routes/language', {
            companyID: companyInfo.companyID,
            companyName: companyInfo.companyName,
            companyLogo: companyInfo.companyLogo,
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        return (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of language.get('/language', (req,res)=>{})", { script: "language.ts", scope: "language.get('/language', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
reservation.get('/hotel', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        const rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_hotels(?, ?)', [req.session.data.companyID, 1]);
        if (rows[0][0] === undefined || rows[0][0] === null)
            return (0, herlpers_1.errorPage)(req, res, i18n_1.default.t('titleNoHotel', { ns: 'hotel', lng: lng }), i18n_1.default.t('errorHeaderNoHotel', { ns: 'hotel', lng: lng }), i18n_1.default.t('errorBodyNoHotel', { ns: 'hotel', lng: lng }));
        const hotels = yield Promise.all(rows[0].map((row) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            return ({
                hotelID: row['hotel_id'].toString(),
                name: row['name'],
                logo: yield (0, herlpers_1.convertFileToBase64)(row['logo_url']),
                verificationType: row['verification_type'],
                isSelected: row['hotel_id'].toString() === ((_a = req.session.data) === null || _a === void 0 ? void 0 : _a.hotelID)
            });
        })));
        return res.render('routes/hotel', {
            alertText: i18n_1.default.t('alertText', { ns: 'hotel', lng: lng }),
            buttonText: i18n_1.default.t('buttonText', { ns: 'hotel', lng: lng }),
            hotels: hotels,
            error: i18n_1.default.t('noHotelSelectedError', { ns: 'hotel', lng: lng }),
            buttonTextExit: i18n_1.default.t('buttonTextExit', { ns: 'hotel', lng: lng }),
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of reservation.get('/hotel', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/hotel', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
reservation.get('/room', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        return res.render('routes/room', {
            title: i18n_1.default.t('title', { ns: 'room', lng: lng }),
            alertText: i18n_1.default.t('alertText', { ns: 'room', lng: lng }),
            buttonText: i18n_1.default.t('buttonText', { ns: 'room', lng: lng }),
            error: i18n_1.default.t('noHotelSelectedError', { ns: 'room', lng: lng }),
            confirmButton: i18n_1.default.t('confirmButton', { ns: 'room', lng: lng }),
            buttonTextExit: i18n_1.default.t('buttonTextExit', { ns: 'room', lng: lng }),
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of reservation.get('/room', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/room', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
reservation.get('/restaurant', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        const rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_restaurants(?, ?, ?, ?)', [req.session.data.companyID, 1, lng, (_a = req.session.data) === null || _a === void 0 ? void 0 : _a.hotelID]);
        const restaurants = yield Promise.all(rows[0].map((row) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
            return ({
                restaurantID: (_b = (_a = row['restaurants_id']) === null || _a === void 0 ? void 0 : _a.toString()) !== null && _b !== void 0 ? _b : '',
                name: (_d = (_c = row['name']) === null || _c === void 0 ? void 0 : _c.toString()) !== null && _d !== void 0 ? _d : '',
                country: (_f = (_e = row['cuisine']) === null || _e === void 0 ? void 0 : _e.toString()) !== null && _f !== void 0 ? _f : '',
                photo: yield (0, herlpers_1.convertFileToBase64)(row['logo_url']),
                about: (_h = (_g = row['about']) === null || _g === void 0 ? void 0 : _g.toString()) !== null && _h !== void 0 ? _h : '',
                capacity: Number((_j = row['capacity']) !== null && _j !== void 0 ? _j : '1'),
                isSelected: row['restaurants_id'].toString() === ((_k = req.session.data) === null || _k === void 0 ? void 0 : _k.restaurantID),
                hotel_id: (_m = (_l = row['hotel_id']) === null || _l === void 0 ? void 0 : _l.toString()) !== null && _m !== void 0 ? _m : '',
                hotel_name: (_p = (_o = row['hotel_name']) === null || _o === void 0 ? void 0 : _o.toString()) !== null && _p !== void 0 ? _p : '',
                restricted_restaurants: row['restricted_restaurants'],
                always_paid_free: row['always_paid_free'],
            });
        })));
        return res.render('routes/restaurant', {
            title: i18n_1.default.t('title', { ns: 'restaurant', lng: lng }),
            alertText: i18n_1.default.t('alertText', { ns: 'restaurant', lng: lng }),
            buttonText: i18n_1.default.t('buttonText', { ns: 'restaurant', lng: lng }),
            error: i18n_1.default.t('noSelectedRestaurant', { ns: 'restaurant', lng: lng }),
            buttonTextExit: i18n_1.default.t('buttonTextExit', { ns: 'restaurant', lng: lng }),
            restaurants: restaurants,
            viewMenu: i18n_1.default.t('viewMenu', { ns: 'restaurant', lng: lng }),
            orederBeforeBooking: i18n_1.default.t('orederBeforeBooking', { ns: 'restaurant', lng: lng }),
            orederBeforeBookingAlert: i18n_1.default.t('orederBeforeBookingAlert', { ns: 'restaurant', lng: lng }),
            menuModalTitle: i18n_1.default.t('menuModalTitle', { ns: 'restaurant', lng: lng }),
            close: i18n_1.default.t('close', { ns: 'restaurant', lng: lng }),
            dateTableTitle: i18n_1.default.t('dateTableTitle', { ns: 'restaurant', lng: lng }),
            timeTableTitle: i18n_1.default.t('timeTableTitle', { ns: 'restaurant', lng: lng }),
            timeZoneTableTitle: i18n_1.default.t('timeZoneTableTitle', { ns: 'restaurant', lng: lng }),
            mealTypeTableTitle: i18n_1.default.t('mealTypeTableTitle', { ns: 'restaurant', lng: lng }),
            warningCrossHotel: i18n_1.default.t('warningCrossHotel', { ns: 'restaurant', lng: lng }),
            selectedHotel: (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.hotelID,
            alwaysPaid: i18n_1.default.t('alwaysPaid', { ns: 'restaurant', lng: lng }),
            confirmModalContinueButton: i18n_1.default.t('confirmModalContinueButton', { ns: 'restaurant', lng: lng }),
            confirmModalCancelButton: i18n_1.default.t('confirmModalCancelButton', { ns: 'restaurant', lng: lng }),
            confirmModalTitle: i18n_1.default.t('confirmModalTitle', { ns: 'restaurant', lng: lng }),
            alwaysFree: i18n_1.default.t('alwaysFree', { ns: 'restaurant', lng: lng }),
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
reservation.get('/time', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        const rows_arrival_departure = yield (0, mysqlProvider_1.executeQuery)('CALL get_pick_dates(?, ?, ?)', [req.session.data.guest_reservation_id, (_a = req.session.data) === null || _a === void 0 ? void 0 : _a.restaurantID, (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.companyID]);
        let dates = rows_arrival_departure[0][0];
        const start_date = new Date(dates['start_date']);
        const end_date = new Date(dates['end_date']);
        if (start_date > end_date) {
            return (0, herlpers_1.errorPage)(req, res, i18n_1.default.t('errorDepartureHead', { ns: 'time', lng: lng }), i18n_1.default.t('errorDepartureHead', { ns: 'time', lng: lng }), i18n_1.default.t('errorDepartureBody', { ns: 'time', lng: lng }), i18n_1.default.t('copyError', { ns: 'time', lng: lng }), i18n_1.default.t('goBack', { ns: 'time', lng: lng }), true);
        }
        else {
            return res.render('routes/time', {
                title: i18n_1.default.t('title', { ns: 'time', lng: lng }),
                alertText: i18n_1.default.t('alertText', { ns: 'time', lng: lng }),
                buttonText: i18n_1.default.t('buttonText', { ns: 'time', lng: lng }),
                error: i18n_1.default.t('noSelectedRestaurant', { ns: 'time', lng: lng }),
                buttonTextExit: i18n_1.default.t('buttonTextExit', { ns: 'time', lng: lng }),
                startDate: dates['start_date'],
                endDate: dates['end_date'],
                paid: (_c = req.session.data) === null || _c === void 0 ? void 0 : _c.paid,
                tableHeader: `${i18n_1.default.t('tableHeader', { ns: 'time', lng: lng })} ${dates['tz']}`,
                roomNumber: req.session.data.roomNumber,
                selectYourDate: i18n_1.default.t('selectYourDate', { ns: 'time', lng: lng }),
                total: i18n_1.default.t('total', { ns: 'time', lng: lng }),
                noSelectedGuestsError: i18n_1.default.t('noSelectedGuestsError', { ns: 'time', lng: lng }),
                noSelectedTimeError: i18n_1.default.t('noSelectedTimeError', { ns: 'time', lng: lng }),
            }, (error, html) => { if (error)
                throw error.toString(); res.send(html); });
        }
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
reservation.get('/confirm', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
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
            tz: rows[0][0]['tz'],
        };
        return res.render('routes/confirm', {
            title: i18n_1.default.t('title', { ns: 'restaurant', lng: lng }),
            companyName: confirmResult.companyName,
            companyLogo: `data:image/jpeg;base64,${Buffer.from(confirmResult.logo, 'utf-8').toString('base64')}`,
            qrCOde: (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.qrCode,
            hotelHeader: i18n_1.default.t('hotelHeader', { ns: 'confirm', lng: lng }),
            paxHeader: i18n_1.default.t('paxHeader', { ns: 'confirm', lng: lng }),
            roomNumberHeader: i18n_1.default.t('roomNumberHeader', { ns: 'confirm', lng: lng }),
            hotel: confirmResult.hotelName,
            roomNumber: confirmResult.roomNumber,
            pax: confirmResult.pax,
            restaurantHeader: i18n_1.default.t('restaurantHeader', { ns: 'confirm', lng: lng }),
            dateHeader: i18n_1.default.t('dateHeader', { ns: 'confirm', lng: lng }),
            timeHeader: i18n_1.default.t('timeHeader', { ns: 'confirm', lng: lng }),
            restaurant: confirmResult.restaurant,
            date: confirmResult.day,
            time: confirmResult.time,
            guestsHeader: i18n_1.default.t('guestsHeader', { ns: 'confirm', lng: lng }),
            guests: confirmResult.names.split(' |-| '),
            createdAt: confirmResult.createdAt,
            paymentHeader: i18n_1.default.t('paymentHeader', { ns: 'confirm', lng: lng }),
            freeHeader: i18n_1.default.t('freeHeader', { ns: 'confirm', lng: lng }),
            paid: confirmResult.paid === 1 ? true : false,
            totalAmmount: confirmResult.totalAmmount,
            currency: confirmResult.currency,
            timeZone: `${i18n_1.default.t('timeZoneMessage', { ns: 'confirm', lng: lng })}${confirmResult.tz}`
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
const checkParamForMenu = (req, res, next) => {
    const { menus_id, day } = req.query;
    if (!menus_id || !day)
        return (0, herlpers_1.notFound)(req, res);
    next();
};
reservation.get('/menu', checkParamForMenu, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        const { menus_id, day } = req.query;
        let rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_menu(?, ?, ?)', [lng, (_a = req.session.data) === null || _a === void 0 ? void 0 : _a.companyID, menus_id]);
        return res.render('routes/menu', {
            data: rows
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of reservation.get('/restaurant', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/restaurant', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
exports.default = reservation;
