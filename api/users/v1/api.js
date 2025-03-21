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
exports.checkPaidInfo = exports.verifyRoom = exports.checkRoom = void 0;
const express = __importStar(require("express"));
const i18n_1 = __importDefault(require("../../../providers/i18n/i18n"));
const mysqlProvider_1 = require("../../../providers/mysqlProvider/mysqlProvider");
const herlpers_1 = require("../../../helpers/herlpers");
const api = express.Router();
api.use(express.json({ limit: '1mb' }));
api.post('/report', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        if (!(0, herlpers_1.validateContentType)(req, res, 'application/json'))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["error"]))
            return;
        (0, herlpers_1.reportErrorAndRespond)("USER ERROR REPORT INSIDE api.post('/report', (req,res)=>{})", { script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error: `${req.body.error}` }, req, res);
    }
    catch (error) {
        (0, herlpers_1.ReportErrorForPostRequests)("USER ERROR REPORT INSIDE CATCH api.post('/report', (req,res)=>{})", { script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
api.get('/state', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        let data = req.session.data;
        return res.status(200).jsonp({ state: 'restaurant' });
        /*const states = [
           { state: 'language', keys: ['companyUUID'] },
           { state: 'language', keys: ['companyUUID', 'companyID'] },
           { state: 'room', keys: ['companyUUID', 'companyID', 'hotelID'] },
           { state: 'room', keys: ['companyUUID', 'companyID', 'hotelID', 'roomNumber'] },
           { state: 'room', keys: ['companyUUID', 'companyID', 'hotelID', 'roomNumber', 'guest_reservation_id'] },
           { state: 'room', keys: ['companyUUID', 'companyID', 'hotelID', 'roomNumber', 'guest_reservation_id', 'verification'] },
           { state: 'room', keys: ['companyUUID', 'companyID', 'hotelID', 'roomNumber', 'guest_reservation_id', 'verification', 'paid'] },
         ];
         const matchedState = states.find(({ keys }) =>
           keys.every(key => key in data && data[key] !== undefined && data[key] !== null) &&
           Object.keys(data).length === keys.length
         );
         if (matchedState) {
           const keysToRemove = ['roomNumber', 'guest_reservation_id', 'verification', 'paid'];
           keysToRemove.forEach(key => {
             if (matchedState.keys.includes(key)) {
               delete data[key];
             }
           });
           return res.status(200).jsonp({ state: matchedState.state });
         }
         if(true)return res.status(200).jsonp({ state: 'room'});*/
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of api.get('/state')", { script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
api.post('/savehotel', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        if (!(0, herlpers_1.validateContentType)(req, res, 'application/json'))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["hotelID"]))
            return;
        req.session.data.hotelID = req.body.hotelID;
        return res.status(200).jsonp({ status: 'success' });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorForPostRequests)("error occured in catch block of api.post('/savehotel', (req,res)=>{})", { script: "api.ts", scope: "api.post('/savehotel', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
api.post('/menuselection', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        if (!(0, herlpers_1.validateContentType)(req, res, 'application/json'))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["restaurantID"]))
            return;
        const rows_dates = yield (0, mysqlProvider_1.executeQuery)('CALL get_pick_dates(?, ?, ?)', [req.session.data.guest_reservation_id, (_a = req.session.data) === null || _a === void 0 ? void 0 : _a.restaurantID, (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.companyID]);
        const rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_menus_urls_or_viewer(?, ?, ?, ?, ?)', [rows_dates[0][0]['start_date'], rows_dates[0][0]['end_date'], req.body.restaurantID, (_c = req.session.data) === null || _c === void 0 ? void 0 : _c.companyID, lng]);
        return res.status(200).jsonp({ status: 'success', data: rows[0], viewMenuTranslation: i18n_1.default.t('viewMenu', { ns: 'restaurant', lng: lng, returnObjects: true }), });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorForPostRequests)("error occured in catch block of api.post('/savehotel', (req,res)=>{})", { script: "api.ts", scope: "api.post('/savehotel', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
api.post('/menu', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        if (!(0, herlpers_1.validateContentType)(req, res, 'application/json'))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["referenceID"]))
            return;
        const rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_menu_pdf_url(?)', [req.body.referenceID]);
        return res.status(200).jsonp({
            status: "success",
            menu: yield (0, herlpers_1.convertFileToBase64)(rows[0][0]['menu_url'].toString())
        });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorForPostRequests)("error occured in catch block of api.post('/menu', (req,res)=>{})", { script: "api.ts", scope: "api.post('/menu', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
const groupedData = (rows) => __awaiter(void 0, void 0, void 0, function* () {
    const data = rows[0];
    const acc = {};
    for (const item of data) {
        const { category_name, subcategory_name, menu_categories_background_url, menu_subcategories_background_url } = item;
        if (!acc[category_name]) {
            acc[category_name] = {};
        }
        if (!acc[category_name][subcategory_name]) {
            acc[category_name][subcategory_name] = [];
        }
        if (menu_categories_background_url) {
            try {
                const base64Image = yield (0, herlpers_1.convertFileToBase64)(menu_categories_background_url);
                item.menu_categories_background_url = base64Image;
            }
            catch (error) {
                console.error(`Failed to convert ${menu_categories_background_url} to Base64:`, error);
            }
        }
        else {
            try {
                const base64Image = yield (0, herlpers_1.convertFileToBase64)('/media/backgrounds/default.jpg');
                item.menu_categories_background_url = base64Image;
            }
            catch (error) {
                console.error(`Failed to convert ${menu_categories_background_url} to Base64:`, error);
            }
        }
        if (menu_subcategories_background_url) {
            try {
                const base64Image = yield (0, herlpers_1.convertFileToBase64)(menu_subcategories_background_url);
                item.menu_subcategories_background_url = base64Image;
            }
            catch (error) {
                console.error(`Failed to convert ${menu_subcategories_background_url} to Base64:`, error);
            }
        }
        else {
            try {
                const base64Image = yield (0, herlpers_1.convertFileToBase64)('/media/backgrounds/default.jpg');
                item.menu_subcategories_background_url = base64Image;
            }
            catch (error) {
                console.error(`Failed to convert ${menu_subcategories_background_url} to Base64:`, error);
            }
        }
        acc[category_name][subcategory_name].push(item);
    }
    return acc;
});
api.post('/menuviewer', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        if (!(0, herlpers_1.validateContentType)(req, res, 'application/json'))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["referenceID"]))
            return;
        const rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_menu(?, ?, ?)', [lng, (_a = req.session.data) === null || _a === void 0 ? void 0 : _a.companyID, req.body.referenceID]);
        let result = yield groupedData(rows);
        return res.render('routes/menu', {
            menuModalTitle: i18n_1.default.t('menuModalTitle', { ns: 'restaurant', lng: lng }),
            close: i18n_1.default.t('close', { ns: 'restaurant', lng: lng }),
            groupedData: result,
            viewOnly: true
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorForPostRequests)("error occured in catch block of api.post('/savehotel', (req,res)=>{})", { script: "api.ts", scope: "api.post('/savehotel', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
const checkRoom = (req, res, lng) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const rows = yield (0, mysqlProvider_1.executeQuery)('CALL check_room(?, ?, ?)', [req.body.roomNumber, (_a = req.session.data) === null || _a === void 0 ? void 0 : _a.hotelID, (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.companyID,]);
    if (!rows[0][0]) {
        res.status(200).jsonp({ status: 'noRoom', errorText: i18n_1.default.t('invalidRoom', { ns: 'room', lng: lng }) });
        return false;
    }
    else {
        return rows[0][0];
    }
});
exports.checkRoom = checkRoom;
api.post('/checkroom', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        if (!(0, herlpers_1.validateContentType)(req, res, 'application/json'))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["roomNumber"]))
            return;
        let checkResult = yield (0, exports.checkRoom)(req, res, lng);
        if (!checkResult)
            return;
        req.session.data.roomNumber = req.body.roomNumber;
        return res.status(200).jsonp({
            status: 'success',
            result: checkResult,
            verification: {
                verificationBD: i18n_1.default.t('verificationBD', { ns: 'room', lng: lng }),
                verificationDD: i18n_1.default.t('verificationDD', { ns: 'room', lng: lng }),
            },
        });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorForPostRequests)("error occured in catch block of api.post('/checkroom', (req,res)=>{})", { script: "api.ts", scope: "api.post('/checkroom', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
const verifyRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const rows = yield (0, mysqlProvider_1.executeQuery)('CALL verify_room_date(?, ?, ?, ?)', [(_a = req.session.data) === null || _a === void 0 ? void 0 : _a.roomNumber, (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.hotelID, req.body.date, (_c = req.session.data) === null || _c === void 0 ? void 0 : _c.companyID,]);
    return rows[0][0];
});
exports.verifyRoom = verifyRoom;
api.post('/verifyroom', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        if (!(0, herlpers_1.validateContentType)(req, res, 'application/json'))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["date"]))
            return;
        let result = yield (0, exports.verifyRoom)(req, res);
        if (result['result'] && result['result'] === 'noReservation')
            return res.status(200).jsonp({ status: 'error', errorText: i18n_1.default.t('invalidRoom', { ns: 'room', lng: lng }) });
        if (result['result'] && result['result'] === 'wrongDate')
            return res.status(200).jsonp({ status: 'error', errorText: i18n_1.default.t('wrongDate', { ns: 'room', lng: lng }) });
        req.session.data.guest_reservation_id = result['guest_reservations_id'];
        req.session.data.verification = req.body.date;
        res.status(200).jsonp({ status: 'success' });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorForPostRequests)("error occured in catch block of api.post('/verifyroom', (req,res)=>{})", { script: "api.ts", scope: "api.post('/verifyroom', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
function handleCancel(req, res) {
    var _a, _b;
    let apiUrl = ((_a = req.session.data) === null || _a === void 0 ? void 0 : _a.companyUUID) === undefined ? '' : (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.companyUUID;
    req.session.destroy((_) => { });
    return res.redirect(`/reservation?id=${apiUrl}`);
}
api.get('/cancelreservation', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        handleCancel(req, res);
    }
    catch (error) {
        (0, herlpers_1.logErrorAndRespond)("error occured in catch block of api.post('/cancelreservation', (req,res)=>{})", { script: "api.ts", scope: "api.post('/cancelreservation', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
const checkPaidInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const rows = yield (0, mysqlProvider_1.executeQuery)('CALL check_paid_info(?, ?, ?, ?, ?)', [(_a = req.session.data) === null || _a === void 0 ? void 0 : _a.hotelID, (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.roomNumber, (_c = req.session.data) === null || _c === void 0 ? void 0 : _c.guest_reservation_id, req.body.restaurantID, (_d = req.session.data) === null || _d === void 0 ? void 0 : _d.companyID]);
    return rows[0][0];
});
exports.checkPaidInfo = checkPaidInfo;
api.post('/saverestaurant', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        if (!(0, herlpers_1.validateContentType)(req, res, 'application/json'))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["restaurantID"]))
            return;
        req.session.data.restaurantID = req.body.restaurantID;
        let result = yield (0, exports.checkPaidInfo)(req, res);
        switch (result['result']) {
            case "alwaysPaid":
                res.status(200).jsonp({ "status": "success", notice: i18n_1.default.t('alwaysPaidNotice', { ns: 'restaurant', lng: lng }), pressContinue: i18n_1.default.t('pressContinue', { ns: 'restaurant', lng: lng }), });
                req.session.data.paid = true;
                break;
            case "alwaysFree":
                res.status(200).jsonp({ "status": "success", alwaysFreeNotice: i18n_1.default.t('alwaysFreeNotice', { ns: 'restaurant', lng: lng }), pressContinue: i18n_1.default.t('pressContinue', { ns: 'restaurant', lng: lng }), });
                req.session.data.paid = false;
                break;
            case "restrictrd":
                res.status(202).jsonp({ "status": "error", notice: i18n_1.default.t('restrictrdNotice', { ns: 'restaurant', lng: lng }), });
                break;
            case "crossHotelPaid":
                res.status(200).jsonp({ "status": "success", notice: i18n_1.default.t('crossHotelNotice', { ns: 'restaurant', lng: lng }), pressContinue: i18n_1.default.t('pressContinue', { ns: 'restaurant', lng: lng }), });
                req.session.data.paid = true;
                break;
            case "success":
                if (Number(result['remaining']) <= 0) {
                    req.session.data.paid = true;
                    res.status(200).jsonp({
                        status: 'success',
                        paidReservation: i18n_1.default.t('paidReservation', { ns: 'restaurant', lng: lng }),
                        pressContinue: i18n_1.default.t('pressContinue', { ns: 'restaurant', lng: lng }),
                    });
                }
                else {
                    req.session.data.paid = false;
                    res.status(200).jsonp({
                        status: 'success',
                        freeReservation: i18n_1.default.t('freeReservation', { ns: 'restaurant', lng: lng }),
                        remainingReservations: i18n_1.default.t('remainingReservations', { ns: 'restaurant', lng: lng }),
                        pressContinue: i18n_1.default.t('pressContinue', { ns: 'restaurant', lng: lng }),
                        remaining: result['remaining']
                    });
                }
                break;
            default:
                break;
        }
    }
    catch (error) {
        (0, herlpers_1.ReportErrorForPostRequests)("error occured in catch block of api.post('/saverestaurant', (req,res)=>{})", { script: "api.ts", scope: "api.post('/saverestaurant', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
api.post('/getavailabledate', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        if (!(0, herlpers_1.validateContentType)(req, res, 'application/json'))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["desiredDate"]))
            return;
        const rows_names = yield (0, mysqlProvider_1.executeQuery)('CALL get_names(?)', [req.session.data.guest_reservation_id]);
        if (rows_names[0][0] != undefined) {
            let names = rows_names[0][0]['names'].split(' |-| ');
            const rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_available_date(?, ?, ?)', [(_a = req.session.data) === null || _a === void 0 ? void 0 : _a.restaurantID, req.body.desiredDate, (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.companyID]);
            return res.status(200).jsonp({
                status: 'success',
                data: rows[0],
                free: i18n_1.default.t('freeText', { ns: 'time', lng: lng }),
                errorRestaurantNotAvailable: i18n_1.default.t('errorRestaurantNotAvailable', { ns: 'time', lng: lng }),
                RoomBasedReservation: i18n_1.default.t('RoomBasedReservation', { ns: 'time', lng: lng }),
                paxBasedReservation: i18n_1.default.t('paxBasedReservation', { ns: 'time', lng: lng }),
                roomNumber: (_c = req.session.data) === null || _c === void 0 ? void 0 : _c.roomNumber,
                names: names,
                table: {
                    price: i18n_1.default.t('priceTable', { ns: 'time', lng: lng }),
                    time: i18n_1.default.t('timeTable', { ns: 'time', lng: lng }),
                    per_person: i18n_1.default.t('tablePerPerson', { ns: 'time', lng: lng }),
                    remaining: i18n_1.default.t('tableRemaining', { ns: 'time', lng: lng }),
                    free: i18n_1.default.t('priceTable', { ns: 'time', lng: lng }),
                    meal_type: JSON.stringify(i18n_1.default.t('mealType', { ns: 'time', lng: lng, returnObjects: true })),
                    total: i18n_1.default.t('total', { ns: 'time', lng: lng }),
                }
            });
        }
        else {
            throw Error("if stetemnt did not find any names in api if((rows_names as any)[0][0] != undefined){}");
        }
    }
    catch (error) {
        (0, herlpers_1.ReportErrorForPostRequests)("error occured in catch block of api.post('/getavailabledate', (req,res)=>{})", { script: "api.ts", scope: "api.post('/getavailabledate', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
api.post('/validate', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    try {
        let lng = (0, herlpers_1.getLanguage)(req);
        if (!(0, herlpers_1.validateContentType)(req, res, 'application/json'))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["selectedTime", "selectedNames", "desiredDate"]))
            return;
        const rows_check_room = yield (0, mysqlProvider_1.executeQuery)('CALL check_room(?, ?, ?)', [(_a = req.session.data) === null || _a === void 0 ? void 0 : _a.roomNumber, (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.hotelID, (_c = req.session.data) === null || _c === void 0 ? void 0 : _c.companyID,]);
        if (!rows_check_room[0][0])
            return res.status(202).jsonp({ status: "error" });
        const rows_verify_room = yield (0, mysqlProvider_1.executeQuery)('CALL verify_room(?, ?, ?, ?)', [(_d = req.session.data) === null || _d === void 0 ? void 0 : _d.roomNumber, (_e = req.session.data) === null || _e === void 0 ? void 0 : _e.hotelID, (_f = req.session.data) === null || _f === void 0 ? void 0 : _f.verification, (_g = req.session.data) === null || _g === void 0 ? void 0 : _g.companyID,]);
        if (rows_verify_room[0][0] !== undefined && rows_verify_room[0][0]['remaining'] !== undefined) {
            if (Number(rows_verify_room[0][0]['remaining']) == 0) {
                req.session.data.paid = true;
            }
            else {
                req.session.data.paid = false;
            }
        }
        else {
            return res.status(202).jsonp({ status: "error" });
        }
        req.session.data.guest_reservation_id = rows_verify_room[0][0]['guest_reservations_id'];
        const rows_get_room = yield (0, mysqlProvider_1.executeQuery)('CALL get_by_room_flag(?)', [(_h = req.session.data) === null || _h === void 0 ? void 0 : _h.restaurantID]);
        if (![0, 1].includes(rows_get_room[0][0]['reservation_by_room']))
            return res.status(202).jsonp({ status: "error" });
        req.session.data.reservation_by_room = rows_get_room[0][0]['reservation_by_room'] === 1 ? true : false;
        const rows_get_available_dates = yield (0, mysqlProvider_1.executeQuery)('CALL get_available_date(?, ?, ?, ?)', [(_j = req.session.data) === null || _j === void 0 ? void 0 : _j.restaurantID, (_k = req.session.data) === null || _k === void 0 ? void 0 : _k.hotelID, req.body.desiredDate, (_l = req.session.data) === null || _l === void 0 ? void 0 : _l.companyID]);
        let userSelect = (rows_get_available_dates[0]).find((time) => time['restaurant_pricing_times_id'] === req.body.selectedTime);
        if (userSelect === undefined || userSelect === null)
            return res.status(202).jsonp({ status: "error" });
        if ((_m = req.session.data) === null || _m === void 0 ? void 0 : _m.reservation_by_room) {
            if (userSelect['remaining'] <= 0)
                return res.status(200).jsonp({ status: "notEnough", errorText: i18n_1.default.t('notEnough', { ns: 'time', lng: lng }), });
        }
        else {
            if (req.body.selectedNames.length > userSelect['remaining'])
                return res.status(200).jsonp({ status: "notEnough", errorText: i18n_1.default.t('notEnough', { ns: 'time', lng: lng }), });
        }
        let totalAmount = 0;
        if ((_o = req.session.data) === null || _o === void 0 ? void 0 : _o.paid) {
            if (userSelect['per_person'] === 1) {
                totalAmount = Number(req.body.selectedNames.length) * Number(userSelect['price']);
            }
            else {
                totalAmount = Number((rows_get_available_dates[0])['price']);
            }
        }
        const insert = yield (0, mysqlProvider_1.executeQuery)('CALL create_reservation(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            req.session.data.guest_reservation_id,
            (_p = req.session.data) === null || _p === void 0 ? void 0 : _p.roomNumber,
            req.body.selectedNames.length,
            req.body.selectedNames.join(' |-| '),
            (_q = req.session.data) === null || _q === void 0 ? void 0 : _q.restaurantID,
            req.body.desiredDate,
            userSelect['time'],
            (_r = req.session.data) === null || _r === void 0 ? void 0 : _r.companyID,
            (_s = req.session.data) === null || _s === void 0 ? void 0 : _s.hotelID,
            'USER END',
            userSelect['currencies_id'],
            ((_t = req.session.data) === null || _t === void 0 ? void 0 : _t.paid) ? userSelect['price'] : null,
            ((_u = req.session.data) === null || _u === void 0 ? void 0 : _u.paid) ? totalAmount : null,
            ((_v = req.session.data) === null || _v === void 0 ? void 0 : _v.paid) ? userSelect['exchange_rate'] : null,
            (_w = req.session.data) === null || _w === void 0 ? void 0 : _w.paid
        ]);
        if (insert[0][0]['result'] === "alreadyReserved")
            return res.status(200).jsonp({ status: "alreadyReserved", errorText: i18n_1.default.t('alreadyReserved', { ns: 'time', lng: lng }) });
        req.session.data.qrCode = insert[0][0]['result'];
        return res.status(200).jsonp({ status: "success" });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorForPostRequests)("error occured in catch block of api.post('/validate', (req,res)=>{})", { script: "api.ts", scope: "api.post('/validate', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
exports.default = api;
