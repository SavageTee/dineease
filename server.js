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
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: './env/.env' });
const express_1 = __importDefault(require("express"));
/*import {rateLimiter} from "./providers/rateLimiter/rateLimiter"*/
const i18nextMiddleware = __importStar(require("i18next-http-middleware"));
const path_1 = __importDefault(require("path"));
const expressSession = __importStar(require("express-session"));
const express_mysql_session_1 = __importDefault(require("express-mysql-session"));
const express_session_1 = __importDefault(require("express-session"));
const i18n_1 = __importDefault(require("./providers/i18n/i18n"));
const logger_1 = __importDefault(require("./providers/logger/logger"));
const i18n_2 = require("./providers/i18n/i18n");
const mysqlProvider_1 = require("./providers/mysqlProvider/mysqlProvider");
const app = (0, express_1.default)();
app.use(i18nextMiddleware.handle(i18n_1.default));
//app.use((req, res, next) => {rateLimiter.consume(req.ip as any ).then(() => {next();}).catch(() => {res.status(429).json({ error: 'Too Many Requests' });});});
const MySQLStore = (0, express_mysql_session_1.default)(expressSession);
const sessionStore = new MySQLStore({}, mysqlProvider_1.pool.promise().pool);
console.log(process.env.SESSION_SECRET);
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "1235asdsaffg",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'sid',
    cookie: {
        maxAge: 1000 * 60 * 60 * 2,
        sameSite: true
    }
}));
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'pages'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use((req, res, next) => {
    const urlParts = req.url.split('/');
    const language = urlParts[1];
    if (!language || !i18n_2.locales.includes(language)) {
        return res.redirect(301, `/en${req.url}`);
    }
    next();
});
const language_1 = __importDefault(require("./pages/language/language"));
app.use('/:lng/language', language_1.default);
const reservation_1 = __importDefault(require("./pages/reservation/reservation"));
app.use('/:lng/reservation', reservation_1.default);
app.use((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.render('404/index', {
        title: i18n_1.default.t('title', { ns: '404', lng: req.language }),
        errorHeader: i18n_1.default.t('errorHeader', { ns: '404', lng: req.language }),
        errorBody: i18n_1.default.t('errorBody', { ns: '404', lng: req.language }),
    });
}));
const server = app.listen(process.env.SERVER_PORT || 4999, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, logger_1.default)({ level: 'info', message: `server started successfully`, metadata: { script: "server.js", port: process.env.SERVER_PORT || 4999 } });
    console.log('Started lestining');
}));
server.on('error', (error) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, logger_1.default)({ level: 'error', message: `cannot create server`, metadata: { script: "server.js", error: error, port: process.env.SERVER_PORT || 4999 }, });
    process.exit(1);
}));
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, logger_1.default)({ level: 'info', message: `Server shutting down...`, metadata: { script: "server.js", port: String(process.env.SERVER_PORT || 4999) }, });
    server.close(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, logger_1.default)({ level: 'info', message: `Server shut down gracefully`, metadata: { script: "server.js", port: String(process.env.SERVER_PORT || 4999) }, });
        process.exit(0);
    }));
}));