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
const api = express.Router();
api.use(express.json({ limit: '1mb' }));
api.post('/savehotel', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if ((req.headers['content-type'] != "application/json")) {
            return res.status(400).jsonp({ status: 'error', orign: 'server', errorText: "Bad Request" });
        }
        ;
        if (Object.keys(req.body).length != 1) {
            return res.status(400).jsonp({ status: 'error', orign: 'server', errorText: "Bad Request" });
        }
        ;
        if (Object.keys(req.body)[0] != "hotelID") {
            return res.status(400).jsonp({ status: 'error', orign: 'server', errorText: "Bad Request" });
        }
        ;
        req.session.data.hotelID = req.body.hotelID;
        return res.status(200).jsonp({ status: 'success' });
    }
    catch (error) {
        (0, herlpers_1.logErrorAndRespond)("error occured in catch block of api.post('/savehotel', (req,res)=>{})", { script: "api.ts", scope: "api.post('/savehotel', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
api.post('/checkroom', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if ((req.headers['content-type'] != "application/json")) {
            return res.status(400).jsonp({ status: 'error', orign: 'server', errorText: "Bad Request" });
        }
        ;
        if (Object.keys(req.body).length != 1) {
            return res.status(400).jsonp({ status: 'error', orign: 'server', errorText: "Bad Request" });
        }
        ;
        if (Object.keys(req.body)[0] != "roomNumber") {
            return res.status(400).jsonp({ status: 'error', orign: 'server', errorText: "Bad Request" });
        }
        ;
        const [rows] = yield mysqlProvider_1.pool.promise().query('CALL check_room(?, ?, ?)', [req.body.roomNumber, (_a = req.session.data) === null || _a === void 0 ? void 0 : _a.hotelID, (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.companyID,]);
        if (rows[0][0]) {
            req.session.data.roomNumber = req.body.roomNumber;
            return res.status(200).jsonp({
                status: 'success',
                result: rows[0][0],
                verification: {
                    verificationBD: i18n_1.default.t('verificationBD', { ns: 'room', lng: req.language }),
                    verificationDD: i18n_1.default.t('verificationDD', { ns: 'room', lng: req.language }),
                },
            });
        }
        else {
            return res.status(200).jsonp({ status: 'noRoom', errorText: i18n_1.default.t('invalidRoom', { ns: 'room', lng: req.language }) });
        }
    }
    catch (error) {
        (0, herlpers_1.logErrorAndRespond)("error occured in catch block of api.post('/checkroom', (req,res)=>{})", { script: "api.ts", scope: "api.post('/checkroom', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
api.post('/verifyroom', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        if ((req.headers['content-type'] != "application/json")) {
            return res.status(400).jsonp({ status: 'error', orign: 'server', errorText: "Bad Request" });
        }
        ;
        if (Object.keys(req.body).length != 1) {
            return res.status(400).jsonp({ status: 'error', orign: 'server', errorText: "Bad Request" });
        }
        ;
        if (Object.keys(req.body)[0] != "date") {
            return res.status(400).jsonp({ status: 'error', orign: 'server', errorText: "Bad Request" });
        }
        ;
        const [rows] = yield mysqlProvider_1.pool.promise().query('CALL verify_room(?, ?, ?, ?)', [(_a = req.session.data) === null || _a === void 0 ? void 0 : _a.roomNumber, (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.hotelID, req.body.date, (_c = req.session.data) === null || _c === void 0 ? void 0 : _c.companyID,]);
        if (rows[0][0] !== undefined) {
            if (Number(rows[0][0]) == 0) {
                req.session.data.paid = true;
            }
            else {
                req.session.data.paid = false;
            }
        }
        return res.status(200).jsonp({
            status: 'success',
            result: rows[0][0],
            transelations: {
                freeReservation: i18n_1.default.t('freeReservation', { ns: 'room', lng: req.language }),
                paidReservation: i18n_1.default.t('paidReservation', { ns: 'room', lng: req.language }),
                remainingReservations: i18n_1.default.t('remainingReservations', { ns: 'room', lng: req.language }),
                pressContinue: i18n_1.default.t('pressContinue', { ns: 'room', lng: req.language }),
            }
        });
    }
    catch (error) {
        (0, herlpers_1.logErrorAndRespond)("error occured in catch block of api.post('/verifyroom', (req,res)=>{})", { script: "api.ts", scope: "api.post('/verifyroom', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
api.get('/cancelreservation', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let apiUrl = ((_a = req.session.data) === null || _a === void 0 ? void 0 : _a.companyID) === undefined ? '' : (_b = req.session.data) === null || _b === void 0 ? void 0 : _b.companyUUID;
        req.session.destroy((err) => { });
        return res.redirect(`/en/language?id=${apiUrl}`);
    }
    catch (error) {
        (0, herlpers_1.logErrorAndRespond)("error occured in catch block of api.post('/cancelreservation', (req,res)=>{})", { script: "api.ts", scope: "api.post('/cancelreservation', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
exports.default = api;
