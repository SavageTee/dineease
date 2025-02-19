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
const multer_1 = __importDefault(require("multer"));
const util_1 = require("util");
const fs_1 = __importDefault(require("fs"));
const mysqlProvider_1 = require("../../../providers/mysqlProvider/mysqlProvider");
const hotels_1 = __importDefault(require("../../../schemas/admin/hotels"));
const admin_herlpers_1 = require("../../../helpers/admin_herlpers");
const adminHotelsApi = express.Router();
adminHotelsApi.use((0, cookie_parser_1.default)());
const csrfProtection = (0, csurf_1.default)({ cookie: true });
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 7 * 1024 * 1024 },
});
const readFileAsync = (0, util_1.promisify)(fs_1.default.readFile);
adminHotelsApi.post('/addnewhotel', csrfProtection, upload.single('logo'), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!(0, admin_herlpers_1.validateContentType)(req, res, 'multipart/form-data;'))
            return;
        if (!(0, admin_herlpers_1.validateRequestBodyKeys)(req, res, ['name', 'verification', 'free_count', 'time_zone', 'plus_days_adjust', 'minus_days_adjust', 'active']))
            return;
        if (!(0, admin_herlpers_1.validateRequestBody)(req, res, hotels_1.default, req.language, req.body))
            return;
        let buffer = null;
        if (req.file) {
            buffer = yield readFileAsync(req.file.path);
            fs_1.default.unlink(req.file.path, (err) => { if (err)
                console.error('Error deleting file:', err); });
        }
        let result = yield (0, mysqlProvider_1.executeQuery)('CALL create_hotel(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [req.body.name, buffer, req.body.verification, req.body.free_count, req.body.time_zone, req.body.plus_days_adjust, req.body.minus_days_adjust, req.body.active, (_a = req.session.adminData) === null || _a === void 0 ? void 0 : _a.companyID, (_b = req.session.adminData) === null || _b === void 0 ? void 0 : _b.adminUser]);
        if (!result || !result[0][0])
            return res.status(202).jsonp({ status: "error", errorText: '' });
        return res.status(200).jsonp({ status: "success", data: (result[0][0]) });
    }
    catch (error) {
        (0, admin_herlpers_1.logErrorAndRespond)("USER ERROR REPORT INSIDE CATCH adminApi.post('/addnewhotel', (req,res)=>{})", { script: "api.ts", scope: "adminApi.post('/addnewhotel', (req,res)=>{})", request: req, error: `${error}` }, req, res);
    }
}));
exports.default = adminHotelsApi;
