import * as dotenv from 'dotenv'; 
dotenv.config({path: './env/.env'})
import  express from "express"
/*import {rateLimiter} from "./providers/rateLimiter/rateLimiter"*/
import * as i18nextMiddleware from 'i18next-http-middleware';
import {Request,Response} from 'express';
import path from "path"
import * as expressSession from "express-session";
import expressMySqlSession from 'express-mysql-session'; 
import session from 'express-session';

import i18next from './providers/i18n/i18n';
import newLog from "./providers/logger/logger"
import {locales} from "./providers/i18n/i18n"
import {pool} from "./providers/mysqlProvider/mysqlProvider";
import {notFound} from "./helpers/herlpers"

const app = express();
app.use(i18nextMiddleware.handle(i18next as any));


//app.use((req, res, next) => {rateLimiter.consume(req.ip as any ).then(() => {next();}).catch(() => {res.status(429).json({ error: 'Too Many Requests' });});});

const MySQLStore   = expressMySqlSession(expressSession);
const sessionStore = new MySQLStore({}, pool.promise().pool as any);
app.use(session({
	secret: process.env.SESSION_SECRET! || "1235asdsaffg",
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

app.set('views', path.join(__dirname, 'pages'))

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    if(req.method === 'POST' || req.url.includes('/api')) return next();
    const urlParts = req.url.split('/');
    const language = urlParts[1];
    if (!language || !locales.includes(language)) {
      return res.redirect(301, `/en${req.url}`); 
    }
    next();
});

import language from "./pages/language/language"
app.use('/:lng/language',language);

import reservation from "./pages/reservation/reservation"
app.use('/:lng/reservation', reservation);

import api from "./api/v1/api"
app.use('/api/v1', api);

app.use(async (req:Request,res:Response):Promise<any> => notFound(req, res));


const server = app.listen(process.env.SERVER_PORT || 4999, async () =>{
    await newLog({level: 'info',message: `server started successfully` ,metadata: {script: "server.js", port: process.env.SERVER_PORT || 4999}},)
    console.log('Started lestining')
})

server.on('error', async (error) => {
    await newLog({level: 'error',message: `cannot create server` ,metadata: {script: "server.js" , error: error , port: process.env.SERVER_PORT || 4999},})
    process.exit(1);
});

process.on('SIGINT', async () => {
    await newLog({level: 'info',message: `Server shutting down...` , metadata: {script: "server.js", port: String(process.env.SERVER_PORT || 4999)},})
    server.close( async () => {
      await newLog({level: 'info',message: `Server shut down gracefully` ,metadata: {script: "server.js", port: String(process.env.SERVER_PORT || 4999)},})
      process.exit(0);
    });
});
 