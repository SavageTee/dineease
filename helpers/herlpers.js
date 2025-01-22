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
exports.goBack = exports.logErrorAndRespond = exports.reportErrorAndRespond = exports.ReportErrorAndRespondErrorPage = exports.ReportErrorAndRespondJsonGet = exports.errorPage = exports.notFound = exports.validateRequestBodyKeys = exports.validateContentType = void 0;
const logger_1 = __importDefault(require("../providers/logger/logger"));
const i18n_1 = __importDefault(require("../providers/i18n/i18n"));
const validateContentType = (req, res) => {
    if (req.headers['content-type'] !== "application/json") {
        res.status(400).jsonp({ status: 'error', origin: 'server', errorText: "Bad Request" });
        return false;
    }
    return true;
};
exports.validateContentType = validateContentType;
const validateRequestBodyKeys = (req, res, expectedKeys) => {
    if (Object.keys(req.body).length !== expectedKeys.length || !expectedKeys.every((key, index) => key === Object.keys(req.body)[index])) {
        res.status(400).jsonp({ status: 'error', origin: 'server', errorText: "Bad Request" });
        return false;
    }
    return true;
};
exports.validateRequestBodyKeys = validateRequestBodyKeys;
const notFound = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.render('404/index', {
        title: i18n_1.default.t('title', { ns: '404', lng: req.language }),
        errorHeader: i18n_1.default.t('errorHeader', { ns: '404', lng: req.language }),
        errorBody: i18n_1.default.t('errorBody', { ns: '404', lng: req.language }),
    });
});
exports.notFound = notFound;
const errorPage = (req, res, title, errorHeader, errorBody, copyError, goBack, showErrorScript) => {
    var _a;
    try {
        let uuid = (_a = req.session.data) === null || _a === void 0 ? void 0 : _a.companyUUID;
        req.session.destroy(() => { });
        return res.render('error/index', {
            title: title,
            errorHeader: errorHeader,
            errorBody: errorBody,
            showErrorScript: showErrorScript || false,
            copyError: copyError || "COPY ERROR",
            goBack: goBack || "GO BACK",
            companyUUID: uuid || ''
        }, (error, html) => { if (error)
            throw error.toString(); res.send(html); });
    }
    catch (error) {
        (0, exports.ReportErrorAndRespondJsonGet)("error occured in catch block of helpers functions export const errorPage()", { script: "helpers.ts", scope: "errorPage()", request: req, error: `${error}` }, req, res);
    }
};
exports.errorPage = errorPage;
const ReportErrorAndRespondJsonGet = (message, metadata, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let generatedUUID = yield (0, logger_1.default)({
        level: 'error',
        message: message,
        metadata: metadata
    });
    return res.status(500).jsonp({
        status: "error",
        errorText: i18n_1.default.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID })
    });
});
exports.ReportErrorAndRespondJsonGet = ReportErrorAndRespondJsonGet;
const ReportErrorAndRespondErrorPage = (message, metadata, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let generatedUUID = yield (0, logger_1.default)({
        level: 'error',
        message: message,
        metadata: metadata
    });
    return (0, exports.errorPage)(req, res, i18n_1.default.t('error', { ns: "server", lng: req.language, UUID: generatedUUID }), i18n_1.default.t('error', { ns: "server", lng: req.language, UUID: generatedUUID }), i18n_1.default.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID }));
});
exports.ReportErrorAndRespondErrorPage = ReportErrorAndRespondErrorPage;
const reportErrorAndRespond = (message, metadata, req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let generatedUUID = yield (0, logger_1.default)({
        level: 'error',
        message: message,
        metadata: metadata
    });
    if (req.method === 'POST') {
        return res.status(200).jsonp({
            status: "error",
            errorText: i18n_1.default.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID })
        });
    }
    else {
        return (0, exports.errorPage)(req, res, i18n_1.default.t('error', { ns: "server", lng: req.language, UUID: generatedUUID }), i18n_1.default.t('error', { ns: "server", lng: req.language, UUID: generatedUUID }), i18n_1.default.t('errorText', { ns: "server", lng: req.language, UUID: generatedUUID }));
    }
});
exports.reportErrorAndRespond = reportErrorAndRespond;
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
const goBack = (res) => { return res.send(`<script>window.history.back();</script>`); };
exports.goBack = goBack;
