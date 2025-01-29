import * as express from "express"
import {Response, Request, NextFunction} from "express"

import i18next from "../../../../providers/i18n/i18n"
import {executeQuery} from "../../../../providers/mysqlProvider/mysqlProvider"
import { logErrorAndRespond, notFound, errorPage, validateContentType, validateRequestBodyKeys, reportErrorAndRespond, ReportErrorAndRespondJsonGet } from "../../../../helpers/herlpers"

const adminApi = express.Router()
adminApi.use(express.json({limit: '1mb'}))




export default adminApi;

