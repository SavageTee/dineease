"use strict";
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
exports.errorPage = exports.notFound = exports.logErrorAndRespond = void 0;
const logger_1 = __importDefault(require("../providers/logger/logger"));
const i18n_1 = __importDefault(require("../providers/i18n/i18n"));
const logErrorAndRespond = (message, metadata, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let generatedUUID = yield (0, logger_1.default)({
        level: 'error',
        message: message,
        metadata: metadata
    });
    if (req.method === 'POST') {
        return res.status(500).jsonp({
            status: "error",
            errorText: i18n_1.default.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID })
        });
    }
    else {
        return (0, exports.errorPage)(req, res, i18n_1.default.t('error', { ns: "server", lng: req.language, UUID: generatedUUID }), i18n_1.default.t('error', { ns: "server", lng: req.language, UUID: generatedUUID }), i18n_1.default.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID }));
    }
});
exports.logErrorAndRespond = logErrorAndRespond;
const notFound = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.render('404/index', {
        title: i18n_1.default.t('title', { ns: '404', lng: req.language }),
        errorHeader: i18n_1.default.t('errorHeader', { ns: '404', lng: req.language }),
        errorBody: i18n_1.default.t('errorBody', { ns: '404', lng: req.language }),
    });
});
exports.notFound = notFound;
const errorPage = (req, res, title, errorHeader, errorBody) => __awaiter(void 0, void 0, void 0, function* () {
    return res.render('error/index', {
        title: title,
        errorHeader: errorHeader,
        errorBody: errorBody,
    });
});
exports.errorPage = errorPage;
