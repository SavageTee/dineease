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
        });
    }
    catch (error) {
        console.log(error);
        return (0, herlpers_1.logErrorAndRespond)("error occured in catch block of language.get('/', checkIdParam, (req,res)=>{})", { script: "language.ts", scope: "language.get('/', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
reservation.get('/hotel', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_hotels(?)', [req.session.data.companyID]);
        if (rows[0][0] === undefined || rows[0][0] === null)
            return (0, herlpers_1.errorPage)(req, res, i18n_1.default.t('titleNoHotel', { ns: 'hotel', lng: req.language }), i18n_1.default.t('errorHeaderNoHotel', { ns: 'hotel', lng: req.language }), i18n_1.default.t('errorBodyNoHotel', { ns: 'hotel', lng: req.language }));
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
            title: i18n_1.default.t('title', { ns: 'hotel', lng: req.language }),
            alertText: i18n_1.default.t('alertText', { ns: 'hotel', lng: req.language }),
            buttonText: i18n_1.default.t('buttonText', { ns: 'hotel', lng: req.language }),
            hotels: hotels,
            error: i18n_1.default.t('noHotelSelectedError', { ns: 'hotel', lng: req.language }),
            buttonTextExit: i18n_1.default.t('buttonTextExit', { ns: 'hotel', lng: req.language }),
        });
    }
    catch (error) {
        (0, herlpers_1.logErrorAndRespond)("error occured in catch block of reservation.get('/hotel', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/hotel', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
exports.default = reservation;
