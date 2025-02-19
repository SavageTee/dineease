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
exports.startAdminServer = exports.admin = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const expressSession = __importStar(require("express-session"));
const express_mysql_session_1 = __importDefault(require("express-mysql-session"));
const express_session_1 = __importDefault(require("express-session"));
const logger_1 = __importDefault(require("./providers/logger/logger"));
const i18n_1 = require("./providers/i18n/i18n");
const mysqlProvider_1 = require("./providers/mysqlProvider/mysqlProvider");
const admin_herlpers_1 = require("./helpers/admin_herlpers");
exports.admin = (0, express_1.default)();
exports.admin.use(express_1.default.json({ limit: '5mb' }));
exports.admin.use((err, req, res, next) => (0, admin_herlpers_1.RequestLargeError)(err, res, next));
const AdminMySQLStore = (0, express_mysql_session_1.default)(expressSession);
const AdminsessionStore = new AdminMySQLStore({
    schema: {
        tableName: 'admin_sessions',
    }
}, mysqlProvider_1.pool);
exports.admin.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || "1235asdsaffg",
    store: AdminsessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'sid',
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: true
    }
}));
const admin_1 = __importDefault(require("./page/admin/admin"));
exports.admin.use('/:lng/de-admin', admin_1.default);
const api_1 = __importDefault(require("./api/admin/v1/api"));
exports.admin.use('/api/v1', api_1.default);
const hotels_1 = __importDefault(require("./api/admin/v1/hotels"));
exports.admin.use('/api/v1/hotels', hotels_1.default);
exports.admin.set('view engine', 'ejs');
exports.admin.set('views', path_1.default.join(__dirname, 'page/admin'));
exports.admin.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
exports.admin.use((req, res, next) => {
    if (req.method === 'POST' || req.url.includes('/api') || req.url.includes('favicon.ico'))
        return next();
    const urlParts = req.url.split('/');
    const language = urlParts[1];
    if (!language || !i18n_1.locales.includes(language)) {
        return res.redirect(301, `/en${req.url}`);
    }
    next();
});
exports.admin.use((req, res) => __awaiter(void 0, void 0, void 0, function* () { return (0, admin_herlpers_1.notFound)(req, res); }));
const startAdminServer = () => {
    const server = exports.admin.listen(process.env.ADMIN_SERVER_PORT || 8001, () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, logger_1.default)({
            level: 'info',
            message: `admin_server started successfully`,
            metadata: { script: "admin_server.js", port: process.env.ADMIN_SERVER_PORT || 8001 },
        });
        console.log('Started listening: ADMIN SERVER');
    }));
    server.on('error', (error) => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, logger_1.default)({
            level: 'error',
            message: `cannot create server`,
            metadata: { script: "admin_server.js", error: error, port: process.env.ADMIN_SERVER_PORT || 8001 },
        });
        process.exit(1);
    }));
    process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, logger_1.default)({
            level: 'info',
            message: `Server shutting down...`,
            metadata: { script: "admin_server.js", port: String(process.env.ADMIN_SERVER_PORT || 8001) },
        });
        server.close(() => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, logger_1.default)({
                level: 'info',
                message: `Server shut down gracefully`,
                metadata: { script: "admin_server.js", port: String(process.env.ADMIN_SERVER_PORT || 8001) },
            });
            process.exit(0);
        }));
    }));
};
exports.startAdminServer = startAdminServer;
