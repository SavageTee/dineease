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
exports.goBack = exports.logErrorAndRespond = exports.reportErrorAndRespond = exports.validateRequestBody = exports.LimitFileSize = exports.RequestLargeError = exports.ReportErrorAndRespondErrorPage = exports.ReportErrorAndRespondJsonGet = exports.errorPage = exports.notFound = exports.validateRequestBodyKeys = exports.validateContentType = void 0;
const logger_1 = __importDefault(require("../providers/logger/logger"));
const i18n_1 = __importDefault(require("../providers/i18n/i18n"));
const validateContentType = (req, res, contentType) => {
    var _a;
    if (!((_a = req.headers['content-type']) === null || _a === void 0 ? void 0 : _a.includes(contentType))) {
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
    try {
        let uuid = ''; /*req.session.data?.companyUUID;*/
        console.log(uuid);
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
const RequestLargeError = (err, res, next) => {
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            status: 'error',
            errorText: 'Request Entity Too Large'
        });
    }
    next(err);
};
exports.RequestLargeError = RequestLargeError;
const LimitFileSize = (err, req, res, next, path) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(202).json({
            status: 'error',
            origin: 'fields',
            errorText: [{ path: [path], message: 'Request Entity Too Large' }]
        });
    }
    next(err);
};
exports.LimitFileSize = LimitFileSize;
const validateRequestBody = (req, res, generateSchema, language, body) => {
    const result = generateSchema(language).validate(body);
    if (result.error) {
        const uniqueErrors = result.error.details.reduce((acc, current) => {
            const isDuplicate = acc.some(error => 
            //error.message === current.message && 
            JSON.stringify(error.path) === JSON.stringify(current.path));
            if (!isDuplicate) {
                acc.push({ message: current.message, path: current.path });
            }
            return acc;
        }, []);
        res.status(202).json({
            status: 'error',
            origin: 'fields',
            errorText: uniqueErrors
        });
        return false;
    }
    return true;
};
exports.validateRequestBody = validateRequestBody;
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
