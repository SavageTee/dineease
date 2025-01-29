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
const herlpers_1 = require("./helpers/herlpers");
const admin_server_1 = require("./admin_server");
const app = (0, express_1.default)();
app.use(i18nextMiddleware.handle(i18n_1.default));
//app.use((req, res, next) => {rateLimiter.consume(req.ip as any ).then(() => {next();}).catch(() => {res.status(429).json({ error: 'Too Many Requests' });});});
const MySQLStore = (0, express_mysql_session_1.default)(expressSession);
const sessionStore = new MySQLStore({
    schema: {
        tableName: 'users_session',
    }
}, mysqlProvider_1.pool);
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "1235asdsaffg",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'sid',
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: true
    }
}));
app.set('view engine', 'ejs');
app.set('views', path_1.default.join(__dirname, 'page'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use((req, res, next) => {
    //return errorPage(req, res, 'this is the title','error header', "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum","COPY ERROR","GO BACK");
    if (req.method === 'POST' || req.url.includes('/api') || req.url.includes('favicon.ico'))
        return next();
    const urlParts = req.url.split('/');
    const language = urlParts[1];
    if (!language || !i18n_2.locales.includes(language)) {
        return res.redirect(301, `/en${req.url}`);
    }
    next();
});
const language_1 = __importDefault(require("./pages/language/language"));
app.use('/:lng/language', language_1.default);
/*import reservation from "./pages/reservation/reservation"
app.use('/:lng/reservation', reservation);*/
const reservation_1 = __importDefault(require("./page/reservation"));
app.use('/:lng/reservation', reservation_1.default);
const api_1 = __importDefault(require("./api/v1/api"));
app.use('/api/v1', api_1.default);
app.use((req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, herlpers_1.notFound)(req, res); }));
const server = app.listen(process.env.SERVER_PORT || 4999, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, logger_1.default)({ level: 'info', message: `server started successfully`, metadata: { script: "server.js", port: process.env.SERVER_PORT || 4999 } });
    console.log('Started lestining: server');
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
(0, admin_server_1.startAdminServer)();
