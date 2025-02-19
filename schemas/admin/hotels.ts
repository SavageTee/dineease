import Joi from "joi";
import i18next from "../../providers/i18n/i18n"

const generateSchema = (lng:string) => Joi.object({

    name: Joi.string().min(1).max(100).required().messages({
      'string.empty': i18next.t('validation.name.required', { ns: 'admin_hotels_page', lng: lng }),
      'string.base': i18next.t('validation.name.string', { ns: 'admin_hotels_page', lng: lng }),
      'string.min': i18next.t('validation.name.min', { ns: 'admin_hotels_page', lng: lng }),
      'string.max': i18next.t('validation.name.max', { ns: 'admin_hotels_page', lng: lng }),
      'any.required': i18next.t('validation.name.required', { ns: 'admin_hotels_page', lng: lng }),
    }),

    logo: Joi.string().allow(null).pattern(/^(\d+,)*\d+$/).messages({
      'string.base': i18next.t('validation.logo.string', { ns: 'admin_hotels_page', lng: lng }),
      'string.pattern.base': i18next.t('validation.logo.pattern', { ns: 'admin_hotels_page', lng: lng }),
    }),

    verification: Joi.number().integer().min(0).required().messages({
      'number.base': i18next.t('validation.verification.number', { ns: 'admin_hotels_page', lng: lng }),
      'number.integer': i18next.t('validation.verification.integer', { ns: 'admin_hotels_page', lng: lng }),
      'number.min': i18next.t('validation.verification.min', { ns: 'admin_hotels_page', lng: lng }),
      'any.required': i18next.t('validation.verification.required', { ns: 'admin_hotels_page', lng: lng }),
    }),

    free_count: Joi.number().integer().min(0).required().messages({
      'number.base': i18next.t('validation.free_count.number', { ns: 'admin_hotels_page', lng: lng }),
      'number.integer': i18next.t('validation.free_count.integer', { ns: 'admin_hotels_page', lng: lng }),
      'number.min': i18next.t('validation.free_count.min', { ns: 'admin_hotels_page', lng: lng }),
      'any.required': i18next.t('validation.free_count.required', { ns: 'admin_hotels_page', lng: lng }),
    }),

    time_zone: Joi.string().pattern(/^[+-]\d{2}:\d{2}$/).required().messages({
      'string.base': i18next.t('validation.time_zone.string', { ns: 'admin_hotels_page', lng: lng }),
      'string.pattern.base': i18next.t('validation.time_zone.pattern', { ns: 'admin_hotels_page', lng: lng }),
      'any.required': i18next.t('validation.time_zone.required', { ns: 'admin_hotels_page', lng: lng }),
    }),

    plus_days_adjust: Joi.number().integer().min(0).required().messages({
      'number.base': i18next.t('validation.plus_days_adjust.number', { ns: 'admin_hotels_page', lng: lng }),
      'number.integer': i18next.t('validation.plus_days_adjust.integer', { ns: 'admin_hotels_page', lng: lng }),
      'number.min': i18next.t('validation.plus_days_adjust.min', { ns: 'admin_hotels_page', lng: lng }),
      'any.required': i18next.t('validation.plus_days_adjust.required', { ns: 'admin_hotels_page', lng: lng }),
    }),

    minus_days_adjust: Joi.number().integer().min(0).required().messages({
      'number.base': i18next.t('validation.minus_days_adjust.number', { ns: 'admin_hotels_page', lng: lng }),
      'number.integer': i18next.t('validation.minus_days_adjust.integer', { ns: 'admin_hotels_page', lng: lng }),
      'number.min': i18next.t('validation.minus_days_adjust.min', { ns: 'admin_hotels_page', lng: lng }),
      'any.required': i18next.t('validation.minus_days_adjust.required', { ns: 'admin_hotels_page', lng: lng }),
    }),
    
    active: Joi.number().integer().min(0).required().messages({
      'number.base': i18next.t('validation.active.number', { ns: 'admin_hotels_page', lng: lng }),
      'number.integer': i18next.t('validation.active.integer', { ns: 'admin_hotels_page', lng: lng }),
      'number.min': i18next.t('validation.active.min', { ns: 'admin_hotels_page', lng: lng }),
      'any.required': i18next.t('validation.active.required', { ns: 'admin_hotels_page', lng: lng }),
    }),

}).options({ abortEarly: false });

export default generateSchema;