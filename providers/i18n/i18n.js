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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.locales = void 0;
const i18next = __importStar(require("i18next"));
const i18nextMiddleware = __importStar(require("i18next-http-middleware"));
const i18next_fs_backend_1 = __importDefault(require("i18next-fs-backend"));
const path = __importStar(require("path"));
exports.locales = ['en', 'de', 'ar', 'fr', 'es'];
i18next
    .use(i18next_fs_backend_1.default)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
    debug: false,
    fallbackLng: 'en',
    backend: {
        loadPath: path.join(__dirname, '../../locales/{{lng}}/{{ns}}.json'),
    },
    ns: ['hotel', '404', 'server', 'room', 'restaurant', 'time'],
    detection: {
        order: ['path', 'header'],
        caches: [],
        lookupFromPathIndex: 0,
    },
});
exports.default = i18next;
