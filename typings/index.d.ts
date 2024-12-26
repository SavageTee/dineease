import * as express from 'express';
import * as jwt from "jsonwebtoken"
import * as i18next from 'i18next';

declare global {
namespace Express{
    interface Request {
        preferredLanguage: string, 
        accessToken?:  string | jwt.JwtPayload | undefined 
    }
}
}

declare global {
  type companyInfo = {
      companyID: number,
      companyName: string,
      companyLogo: any | undefined
  }
}