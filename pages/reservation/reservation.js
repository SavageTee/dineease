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
const i18n_1 = __importDefault(require("../../providers/i18n/i18n"));
const mysqlProvider_1 = require("../../providers/mysqlProvider/mysqlProvider");
const herlpers_1 = require("../../helpers/herlpers");
const reservation = express.Router();
reservation.get('/', sessionCheck, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [rows] = yield mysqlProvider_1.pool.promise().query('CALL get_hotels(?)', [req.session.data.companyID]);
        if (rows[0][0] === undefined || rows[0][0] === null)
            return (0, herlpers_1.errorPage)(req, res, i18n_1.default.t('titleNoHotel', { ns: 'reservation', lng: req.language }), i18n_1.default.t('errorHeaderNoHotel', { ns: 'reservation', lng: req.language }), i18n_1.default.t('errorBodyNoHotel', { ns: 'reservation', lng: req.language }));
        const hotels = rows[0].map((row) => ({
            hotelID: row['hotel_id'].toString(),
            name: row['name'],
            logo: row['logo'] ? `data:image/jpeg;base64,${Buffer.from(row['logo'], 'utf-8').toString('base64')}` : null,
            verfificationType: row['verfification_type'],
        }));
        /* let hotels:[]hotels = {
           hotelID: (rows as any)[0][0]['hotel_id'].toString(),
           name: (rows as any)[0][0]['name'],
           logo: (rows as any)[0][0]['logo'],
           verfificationType: (rows as any)[0][0]['verfification_type'],
         };*/
        res.render('reservation/index', {
            title: i18n_1.default.t('welcome', { ns: 'reservation', lng: req.language }),
            hotels: hotels
        });
    }
    catch (error) {
        (0, herlpers_1.logErrorAndRespond)("error occured in catch block of reservation.get('/', checkIdParam, (req,res)=>{})", { script: "reservation.ts", scope: "reservation.get('/', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
        return (0, herlpers_1.notFound)(req, res);
    }
}));
function sessionCheck(req, res, next) {
    if (req.session.data && req.session.data !== null && req.session.data.companyUUID && req.session.data.companyID) {
        next();
    }
    else {
        res.redirect('/');
    }
}
exports.default = reservation;
