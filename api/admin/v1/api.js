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
const bcrypt_1 = __importDefault(require("bcrypt"));
const csurf_1 = __importDefault(require("csurf"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const i18n_1 = __importDefault(require("../../../providers/i18n/i18n"));
const mysqlProvider_1 = require("../../../providers/mysqlProvider/mysqlProvider");
const herlpers_1 = require("../../../helpers/herlpers");
const adminApi = express.Router();
adminApi.use(express.json({ limit: '1mb' }));
adminApi.use((0, cookie_parser_1.default)());
const csrfProtection = (0, csurf_1.default)({ cookie: true });
adminApi.post('/report', csrfProtection, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!(0, herlpers_1.validateContentType)(req, res))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["error"]))
            return;
        (0, herlpers_1.reportErrorAndRespond)("USER ERROR REPORT INSIDE api.post('/report', (req,res)=>{})", { script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error: `${req.body.error}` }, req, res);
    }
    catch (error) {
        (0, herlpers_1.logErrorAndRespond)("USER ERROR REPORT INSIDE CATCH api.post('/report', (req,res)=>{})", { script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
adminApi.get('/adminstate', csrfProtection, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = req.session.adminData;
        if (data.adminUser)
            return res.status(200).jsonp({ state: 'dashboard' });
        return res.status(200).jsonp({ state: 'login' });
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of api.get('/state')", { script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
adminApi.post('/login', csrfProtection, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!(0, herlpers_1.validateContentType)(req, res))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["username", "password"]))
            return;
        let result = yield (0, mysqlProvider_1.executeQuery)('CALL admin_login(?, ?)', [req.body.username, (_a = req.session.adminData) === null || _a === void 0 ? void 0 : _a.companyID]);
        if (!result || !result[0][0])
            return res.status(202).jsonp({ status: "error", errorText: i18n_1.default.t('invalidCredentials', { ns: 'admin_login', lng: req.language }) });
        let isMatch = yield bcrypt_1.default.compare(req.body.password, result[0][0]['password']);
        if (isMatch) {
            req.session.adminData['adminUser'] = result[0][0]['admin_users_id'];
            return res.status(200).jsonp({ status: "success" });
        }
        return res.status(202).jsonp({ status: "error", errorText: i18n_1.default.t('invalidCredentials', { ns: 'admin_login', lng: req.language }) });
    }
    catch (error) {
        (0, herlpers_1.logErrorAndRespond)("USER ERROR REPORT INSIDE CATCH api.post('/report', (req,res)=>{})", { script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
adminApi.post('/saveuserchanges', csrfProtection, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!(0, herlpers_1.validateContentType)(req, res))
            return;
        if (!(0, herlpers_1.validateRequestBodyKeys)(req, res, ["displayName", "email", "phone"]))
            return;
        let result = yield (0, mysqlProvider_1.executeQuery)('CALL save_user_changes(?, ?, ?, ?)', [req.body.displayName, req.body.phone, req.body.email, (_a = req.session.adminData) === null || _a === void 0 ? void 0 : _a.adminUser]);
        if (!result || !result[0][0])
            return res.status(202).jsonp({ status: "error", errorText: i18n_1.default.t('updateUnsuccessfull', { ns: 'admin_page', lng: req.language }) });
        return res.status(200).jsonp({ status: "success", data: result });
    }
    catch (error) {
        (0, herlpers_1.logErrorAndRespond)("USER ERROR REPORT INSIDE CATCH adminApi.post('/saveuserchanges', (req,res)=>{})", { script: "api.ts", scope: "adminApi.post('/saveuserchanges', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
adminApi.get('/gethotels', csrfProtection, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let result = yield (0, mysqlProvider_1.executeQuery)('CALL get_hotels(?)', [(_a = req.session.adminData) === null || _a === void 0 ? void 0 : _a.companyID]);
        if (!result || !result[0][0])
            return res.status(202).jsonp({ status: "error", errorText: i18n_1.default.t('updateUnsuccessfull', { ns: 'admin_page', lng: req.language }) });
        console.log(result);
        const updatedData = result[0].map((item) => {
            return Object.assign(Object.assign({}, item), { verification_text: item.verification_type === 0 ? i18n_1.default.t('birthDay', { ns: 'hotels_page', lng: req.language }) : i18n_1.default.t('departureDate', { ns: 'hotels_page', lng: req.language }) });
        });
        console.log(updatedData);
        return res.status(200).jsonp(updatedData);
    }
    catch (error) {
        (0, herlpers_1.logErrorAndRespond)("USER ERROR REPORT INSIDE CATCH adminApi.post('/saveuserchanges', (req,res)=>{})", { script: "api.ts", scope: "adminApi.post('/saveuserchanges', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
function generateHash(password) {
    return __awaiter(this, void 0, void 0, function* () {
        const saltRounds = 10;
        try {
            const hash = yield bcrypt_1.default.hash(password, saltRounds);
            return hash;
        }
        catch (error) {
            console.error('Error generating hash:', error);
            throw error;
        }
    });
}
//generateHash('talal').then((res)=> console.log(res));
exports.default = adminApi;
