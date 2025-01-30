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
const i18n_1 = __importDefault(require("../../../providers/i18n/i18n"));
const mysqlProvider_1 = require("../../../providers/mysqlProvider/mysqlProvider");
const herlpers_1 = require("../../../helpers/herlpers");
const adminApi = express.Router();
adminApi.use(express.json({ limit: '1mb' }));
adminApi.post('/report', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
adminApi.get('/adminstate', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = req.session.adminData;
        const states = [
            { state: 'login', keys: ['companyUUID'] },
            { state: 'login', keys: ['companyUUID', 'companyID'] }
        ];
        const matchedState = states.find(({ keys }) => keys.every(key => key in data && data[key] !== undefined && data[key] !== null) &&
            Object.keys(data).length === keys.length);
        if (matchedState) {
            const keysToRemove = [''];
            keysToRemove.forEach(key => {
                if (matchedState.keys.includes(key)) {
                    delete data[key];
                }
            });
            return res.status(200).jsonp({ state: matchedState.state });
        }
    }
    catch (error) {
        (0, herlpers_1.ReportErrorAndRespondJsonGet)("error occured in catch block of api.get('/state')", { script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
adminApi.post('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (isMatch)
            return res.status(200).jsonp({ status: "success" });
        return res.status(202).jsonp({ status: "error", errorText: i18n_1.default.t('invalidCredentials', { ns: 'admin_login', lng: req.language }) });
    }
    catch (error) {
        (0, herlpers_1.logErrorAndRespond)("USER ERROR REPORT INSIDE CATCH api.post('/report', (req,res)=>{})", { script: "api.ts", scope: "api.post('/report', (req,res)=>{})", request: req, error: `${error}` }, req, res);
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
