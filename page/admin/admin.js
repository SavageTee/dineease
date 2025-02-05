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
const csurf_1 = __importDefault(require("csurf"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const i18n_1 = __importDefault(require("../../providers/i18n/i18n"));
const mysqlProvider_1 = require("../../providers/mysqlProvider/mysqlProvider");
const herlpers_1 = require("../../helpers/herlpers");
const admin = express.Router();
admin.use((0, cookie_parser_1.default)());
const csrfProtection = (0, csurf_1.default)({ cookie: true });
const checkIdParam = (req, res, next) => {
    const { id } = req.query;
    if (!id)
        return (0, herlpers_1.notFound)(req, res);
    if (!req.session.adminData)
        req.session.adminData = {};
    req.session.adminData.companyUUID = id.toString();
    next();
};
admin.get('/', checkIdParam, csrfProtection, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.render('index', { title: i18n_1.default.t('title', { ns: 'admin_page', lng: req.language }), csrfToken: req.csrfToken() }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        return (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of admin.get('/', checkIdParam, (req,res)=>{})", { script: "admin.ts", scope: "admin.get('/', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
admin.get('/login', csrfProtection, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_company(?)', [(_a = req.session.adminData) === null || _a === void 0 ? void 0 : _a.companyUUID]);
        if (rows[0][0] === undefined || rows[0][0] === null)
            return (0, herlpers_1.notFound)(req, res);
        let companyInfo = {
            companyID: rows[0][0]['company_id'].toString(),
            companyName: rows[0][0]['company_name'],
            companyLogo: rows[0][0]['logo'],
        };
        req.session.adminData['companyID'] = companyInfo.companyID;
        return res.render('routes/login', {
            title: i18n_1.default.t('title', { ns: 'admin_login', lng: req.language }),
            companyID: companyInfo.companyID,
            companyName: companyInfo.companyName,
            usernameEmail: i18n_1.default.t('usernameEmail', { ns: 'admin_login', lng: req.language }),
            password: i18n_1.default.t('password', { ns: 'admin_login', lng: req.language }),
            login: i18n_1.default.t('login', { ns: 'admin_login', lng: req.language }),
            signIn: i18n_1.default.t('signIn', { ns: 'admin_login', lng: req.language }),
            signInHeader: i18n_1.default.t('signInHeader', { ns: 'admin_login', lng: req.language }),
            companyLogo: `data:image/jpeg;base64,${Buffer.from(companyInfo.companyLogo, 'utf-8').toString('base64')}`,
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        return (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of admin.get('/login', csrfProtection, (req,res)=>{})", { script: "admin.ts", scope: "login.get('/', csrfProtection, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
admin.get('/dashboard', csrfProtection, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_company(?)', [(_a = req.session.adminData) === null || _a === void 0 ? void 0 : _a.companyUUID]);
        if (rows[0][0] === undefined || rows[0][0] === null)
            return (0, herlpers_1.notFound)(req, res);
        let user = yield (0, mysqlProvider_1.executeQuery)('CALL get_admin_user(?)', [(_b = req.session.adminData) === null || _b === void 0 ? void 0 : _b.adminUser]);
        if (user[0][0] === undefined || user[0][0] === null)
            return (0, herlpers_1.notFound)(req, res);
        let companyInfo = {
            companyID: rows[0][0]['company_id'].toString(),
            companyName: rows[0][0]['company_name'],
            companyLogo: rows[0][0]['logo'],
        };
        let adminUser = {
            userName: user[0][0]['user_name'].toUpperCase(),
            email: user[0][0]['email'],
            phone: user[0][0]['phone'],
            displayName: user[0][0]['display_name'],
            createdAt: user[0][0]['created_at'],
            admin: user[0][0]['admin'] === 1 ? true : false,
        };
        return res.render('routes/dashboard', {
            companyID: companyInfo.companyID,
            companyName: companyInfo.companyName,
            companyLogo: `data:image/jpeg;base64,${Buffer.from(companyInfo.companyLogo, 'utf-8').toString('base64')}`,
            userName: adminUser.userName,
            email: adminUser.email,
            phone: adminUser.phone,
            displayName: adminUser.displayName,
            createdAt: adminUser.createdAt,
            admin: adminUser.admin,
            userModalTitle: i18n_1.default.t('userModalTitle', { ns: 'admin_page', lng: req.language }),
            close: i18n_1.default.t('close', { ns: 'admin_page', lng: req.language }),
            saveChanges: i18n_1.default.t('saveChanges', { ns: 'admin_page', lng: req.language }),
            userNameTitle: i18n_1.default.t('userNameTitle', { ns: 'admin_page', lng: req.language }),
            displayNameTitle: i18n_1.default.t('displayNameTitle', { ns: 'admin_page', lng: req.language }),
            emailTitle: i18n_1.default.t('emailTitle', { ns: 'admin_page', lng: req.language }),
            phoneTitle: i18n_1.default.t('phoneTitle', { ns: 'admin_page', lng: req.language }),
            createdAtTitle: i18n_1.default.t('createdAtTitle', { ns: 'admin_page', lng: req.language }),
            isAdminTitle: i18n_1.default.t('isAdminTitle', { ns: 'admin_page', lng: req.language }),
            hotels: i18n_1.default.t('hotels', { ns: 'admin_page', lng: req.language }),
            statics: i18n_1.default.t('statics', { ns: 'admin_page', lng: req.language }),
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        return (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of admin.get('/dashboard', csrfProtection, (req,res)=>{})", { script: "admin.ts", scope: "admin.get('/dashboard', csrfProtection, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
admin.get('/statics', csrfProtection, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_statics(?)', [(_a = req.session.adminData) === null || _a === void 0 ? void 0 : _a.companyID]);
        if (rows[0][0] === undefined || rows[0][0] === null)
            return (0, herlpers_1.notFound)(req, res);
        return res.render('routes/statics', {
            title: i18n_1.default.t('title', { ns: 'admin_login', lng: req.language }),
            mostLikedTitle: i18n_1.default.t('mostLikedTitle', { ns: 'statics', lng: req.language }),
            fullRestaurantsTitle: i18n_1.default.t('fullRestaurantsTitle', { ns: 'statics', lng: req.language }),
            TotalReservationsTitle: i18n_1.default.t('TotalReservationsTitle', { ns: 'statics', lng: req.language }),
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        return (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of admin.get('/statics', csrfProtection, (req,res)=>{})", { script: "admin.ts", scope: "login.get('/statics', csrfProtection, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
admin.get('/hotels', csrfProtection, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.render('routes/hotels', {
            codeTitle: i18n_1.default.t('codeTitle', { ns: 'hotels_page', lng: req.language }),
            nameTitle: i18n_1.default.t('nameTitle', { ns: 'hotels_page', lng: req.language }),
            LogoTitle: i18n_1.default.t('LogoTitle', { ns: 'hotels_page', lng: req.language }),
            verificationTitle: i18n_1.default.t('verificationTitle', { ns: 'hotels_page', lng: req.language }),
            NoFreeCountTitle: i18n_1.default.t('NoFreeCountTitle', { ns: 'hotels_page', lng: req.language }),
            timeZoneTitle: i18n_1.default.t('timeZoneTitle', { ns: 'hotels_page', lng: req.language }),
            daysAfterArrivalTitle: i18n_1.default.t('daysAfterArrivalTitle', { ns: 'hotels_page', lng: req.language }),
            daysBeforeDepartureTitle: i18n_1.default.t('daysBeforeDepartureTitle', { ns: 'hotels_page', lng: req.language }),
            createdTitle: i18n_1.default.t('createdTitle', { ns: 'hotels_page', lng: req.language }),
            lastUpdateTitle: i18n_1.default.t('lastUpdateTitle', { ns: 'hotels_page', lng: req.language }),
            addNew: i18n_1.default.t('addNew', { ns: 'hotels_page', lng: req.language }),
            userModalTitle: i18n_1.default.t('addNew', { ns: 'hotels_page', lng: req.language }),
            close: i18n_1.default.t('close', { ns: 'hotels_page', lng: req.language }),
            saveChanges: i18n_1.default.t('saveChanges', { ns: 'hotels_page', lng: req.language }),
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        return (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of admin.get('/statics', csrfProtection, (req,res)=>{})", { script: "admin.ts", scope: "login.get('/statics', csrfProtection, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
exports.default = admin;
