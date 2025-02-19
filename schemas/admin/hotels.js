"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const i18n_1 = __importDefault(require("../../providers/i18n/i18n"));
const generateSchema = (lng) => joi_1.default.object({
    name: joi_1.default.string().min(1).max(100).required().messages({
        'string.empty': i18n_1.default.t('validation.name.required', { ns: 'admin_hotels_page', lng: lng }),
        'string.base': i18n_1.default.t('validation.name.string', { ns: 'admin_hotels_page', lng: lng }),
        'string.min': i18n_1.default.t('validation.name.min', { ns: 'admin_hotels_page', lng: lng }),
        'string.max': i18n_1.default.t('validation.name.max', { ns: 'admin_hotels_page', lng: lng }),
        'any.required': i18n_1.default.t('validation.name.required', { ns: 'admin_hotels_page', lng: lng }),
    }),
    logo: joi_1.default.string().allow(null).pattern(/^(\d+,)*\d+$/).messages({
        'string.base': i18n_1.default.t('validation.logo.string', { ns: 'admin_hotels_page', lng: lng }),
        'string.pattern.base': i18n_1.default.t('validation.logo.pattern', { ns: 'admin_hotels_page', lng: lng }),
    }),
    verification: joi_1.default.number().integer().min(0).required().messages({
        'number.base': i18n_1.default.t('validation.verification.number', { ns: 'admin_hotels_page', lng: lng }),
        'number.integer': i18n_1.default.t('validation.verification.integer', { ns: 'admin_hotels_page', lng: lng }),
        'number.min': i18n_1.default.t('validation.verification.min', { ns: 'admin_hotels_page', lng: lng }),
        'any.required': i18n_1.default.t('validation.verification.required', { ns: 'admin_hotels_page', lng: lng }),
    }),
    free_count: joi_1.default.number().integer().min(0).required().messages({
        'number.base': i18n_1.default.t('validation.free_count.number', { ns: 'admin_hotels_page', lng: lng }),
        'number.integer': i18n_1.default.t('validation.free_count.integer', { ns: 'admin_hotels_page', lng: lng }),
        'number.min': i18n_1.default.t('validation.free_count.min', { ns: 'admin_hotels_page', lng: lng }),
        'any.required': i18n_1.default.t('validation.free_count.required', { ns: 'admin_hotels_page', lng: lng }),
    }),
    time_zone: joi_1.default.string().pattern(/^[+-]\d{2}:\d{2}$/).required().messages({
        'string.base': i18n_1.default.t('validation.time_zone.string', { ns: 'admin_hotels_page', lng: lng }),
        'string.pattern.base': i18n_1.default.t('validation.time_zone.pattern', { ns: 'admin_hotels_page', lng: lng }),
        'any.required': i18n_1.default.t('validation.time_zone.required', { ns: 'admin_hotels_page', lng: lng }),
    }),
    plus_days_adjust: joi_1.default.number().integer().min(0).required().messages({
        'number.base': i18n_1.default.t('validation.plus_days_adjust.number', { ns: 'admin_hotels_page', lng: lng }),
        'number.integer': i18n_1.default.t('validation.plus_days_adjust.integer', { ns: 'admin_hotels_page', lng: lng }),
        'number.min': i18n_1.default.t('validation.plus_days_adjust.min', { ns: 'admin_hotels_page', lng: lng }),
        'any.required': i18n_1.default.t('validation.plus_days_adjust.required', { ns: 'admin_hotels_page', lng: lng }),
    }),
    minus_days_adjust: joi_1.default.number().integer().min(0).required().messages({
        'number.base': i18n_1.default.t('validation.minus_days_adjust.number', { ns: 'admin_hotels_page', lng: lng }),
        'number.integer': i18n_1.default.t('validation.minus_days_adjust.integer', { ns: 'admin_hotels_page', lng: lng }),
        'number.min': i18n_1.default.t('validation.minus_days_adjust.min', { ns: 'admin_hotels_page', lng: lng }),
        'any.required': i18n_1.default.t('validation.minus_days_adjust.required', { ns: 'admin_hotels_page', lng: lng }),
    }),
    active: joi_1.default.number().integer().min(0).required().messages({
        'number.base': i18n_1.default.t('validation.active.number', { ns: 'admin_hotels_page', lng: lng }),
        'number.integer': i18n_1.default.t('validation.active.integer', { ns: 'admin_hotels_page', lng: lng }),
        'number.min': i18n_1.default.t('validation.active.min', { ns: 'admin_hotels_page', lng: lng }),
        'any.required': i18n_1.default.t('validation.active.required', { ns: 'admin_hotels_page', lng: lng }),
    }),
}).options({ abortEarly: false });
exports.default = generateSchema;
