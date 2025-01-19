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
const winston = __importStar(require("winston"));
const flatted_1 = __importDefault(require("flatted"));
const winston_transport_1 = __importDefault(require("winston-transport"));
const mysqlProvider_1 = require("../mysqlProvider/mysqlProvider");
const uuid_1 = require("uuid");
class MysqlTransport extends winston_transport_1.default {
    log(info, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            setImmediate(() => { this.emit('logged', info); });
            try {
                let _ = yield (0, mysqlProvider_1.executeQuery)('CALL create_new_log(?, ?, ?, ?, ?)', [
                    info.level,
                    flatted_1.default.stringify(info.message),
                    flatted_1.default.stringify({ metadata: info.metadata }),
                    new Date(info.timestamp).toISOString().replace('T', ' ').replace('Z', ''),
                    info.uuid,
                ]);
                callback();
            }
            catch (error) {
                console.error(`Error executing MYSQL query: ${error}`);
                callback();
            }
        });
    }
}
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new MysqlTransport()
    ],
});
const newLog = (_a) => __awaiter(void 0, [_a], void 0, function* ({ level, message, metadata }) {
    let uniqueID = (0, uuid_1.v4)();
    logger.log({ level: level, message: message, metadata: metadata, uuid: uniqueID });
    return uniqueID;
});
exports.default = newLog;
