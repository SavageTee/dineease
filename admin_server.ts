import express from "express";
import * as i18nextMiddleware from 'i18next-http-middleware';
import { Request, Response } from 'express';
import path from "path";
import * as expressSession from "express-session";
import expressMySqlSession from 'express-mysql-session';
import session from 'express-session';

import i18next from './providers/i18n/i18n';
import newLog from "./providers/logger/logger";
import { locales } from "./providers/i18n/i18n";
import { pool } from "./providers/mysqlProvider/mysqlProvider";
import { errorPage, notFound } from "./helpers/herlpers";

export const admin = express();

const AdminMySQLStore = expressMySqlSession(expressSession);
const AdminsessionStore = new AdminMySQLStore({
  schema: {
    tableName: 'admin_sessions',
  }
}, pool as any);

admin.use(session({
  secret: process.env.SESSION_SECRET! || "1235asdsaffg",
  store: AdminsessionStore,
  resave: false,
  saveUninitialized: false,
  name: 'sid',
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: true
  }
}));

admin.set('view engine', 'ejs');
admin.set('views', path.join(__dirname, 'page/admin'));
admin.use(express.static(path.join(__dirname, 'public')));

admin.use((req, res, next) => {
  if (req.method === 'POST' || req.url.includes('/api') || req.url.includes('favicon.ico')) return next();
  const urlParts = req.url.split('/');
  const language = urlParts[1];
  if (!language || !locales.includes(language)) {
    return res.redirect(301, `/en${req.url}`);
  }
  next();
});

import adminScript from "./page/admin/admin";
admin.use('/:lng/de-admin', adminScript);

import api from "./api/admin/v1/api"
admin.use('/api/v1', api);

admin.use(async (req: Request, res: Response): Promise<any> => notFound(req, res));

export const startAdminServer = () => { 
  const server = admin.listen(process.env.ADMIN_SERVER_PORT || 8001, async () => {
    await newLog({
      level: 'info',
      message: `admin_server started successfully`,
      metadata: { script: "admin_server.js", port: process.env.ADMIN_SERVER_PORT || 8001 },
    });
    console.log('Started listening: ADMIN SERVER');
  });

  server.on('error', async (error) => {
    await newLog({
      level: 'error',
      message: `cannot create server`,
      metadata: { script: "admin_server.js", error: error, port: process.env.ADMIN_SERVER_PORT || 8001 },
    });
    process.exit(1);
  });

  process.on('SIGINT', async () => {
    await newLog({
      level: 'info',
      message: `Server shutting down...`,
      metadata: { script: "admin_server.js", port: String(process.env.ADMIN_SERVER_PORT || 8001) },
    });
    server.close(async () => {
      await newLog({
        level: 'info',
        message: `Server shut down gracefully`,
        metadata: { script: "admin_server.js", port: String(process.env.ADMIN_SERVER_PORT || 8001) },
      });
      process.exit(0);
    });
  });
};