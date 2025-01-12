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
const admin = express.Router();
const checkIdParam = (req, res, next) => {
    const { id } = req.query;
    if (!id)
        return (0, herlpers_1.notFound)(req, res);
    next();
};
admin.get('/login', checkIdParam, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.query;
        if (id === undefined || id === null)
            return (0, herlpers_1.notFound)(req, res);
        let rows = yield (0, mysqlProvider_1.executeQuery)('CALL get_company(?)', [id]);
        if (rows[0][0] === undefined || rows[0][0] === null)
            return (0, herlpers_1.notFound)(req, res);
        let companyInfo = {
            companyID: rows[0][0]['company_id'].toString(),
            companyName: rows[0][0]['company_name'],
            companyLogo: rows[0][0]['logo'],
        };
        req.session.data = { companyUUID: id.toString(), companyID: companyInfo.companyID };
        return res.render('admin/routes/login', {
            title: i18n_1.default.t('title', { ns: 'admin_login', lng: req.language }),
            companyID: companyInfo.companyID,
            companyName: companyInfo.companyName,
            usernameEmail: i18n_1.default.t('usernameEmail', { ns: 'admin_login', lng: req.language }),
            password: i18n_1.default.t('password', { ns: 'admin_login', lng: req.language }),
            login: i18n_1.default.t('login', { ns: 'admin_login', lng: req.language }),
            signIn: i18n_1.default.t('signIn', { ns: 'admin_login', lng: req.language }),
            signInHeader: i18n_1.default.t('signInHeader', { ns: 'admin_login', lng: req.language }),
            companyLogo: `data:image/jpeg;base64,${Buffer.from(companyInfo.companyLogo, 'utf-8').toString('base64')}`,
        });
    }
    catch (error) {
        return (0, herlpers_1.logErrorAndRespond)("error occured in catch block of language.get('/', checkIdParam, (req,res)=>{})", { script: "language.ts", scope: "language.get('/', checkIdParam, (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
exports.default = admin;
