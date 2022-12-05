import express from "express";
import bodyParser from "body-parser";
import session from 'express-session';
import cookieParser from 'cookie-parser'; 
/* const cookieParser = require("cookie-parser"); */
import {pool} from './files/models/db';

//const fs = require("fs");
//const https = require("https");

// var MySQLStore = require('express-mysql-session')(session);
export const app = express();

//import {pool} from './files/models/db'
/*
pool.getConnection( (error : NodeJS.ErrnoException, connection : PoolConnection) => {
  var sessionStore = new MySQLStore({}, connection);

} )
*/

//const key = fs.readFileSync("privkey.pem", "utf-8");
//const cert = fs.readFileSync("cacert.pem", "utf-8");

import {routing as main_routing} from './files/routes/main-site.routes'
import {routing as dmsm_routing} from './files/routes/DMSM.routes'
import path from "path";
import { getHeapSpaceStatistics } from "v8";
//import { PoolConnection } from "mysql2";
app.set('trust proxy', 1) // trust --first-- proxy
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'files/views'))
app.use(session({
  secret: 'supersecretfuckingpa$$word',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: (60000*1)*60*3, httpOnly: true}
}));

// 3hour *60*3

app.use(cookieParser());

app.set('db_pool', pool)



// const sql = require("./files/models/db.ts"); // Para o corretor de unavailable

// parse requests of content-type: application/json
app.use(bodyParser.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// simple route
/*
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});
*/

// simple route robots
app.get("/robots.txt", (req : any, res : any) => {
  res.json({ message: "Disallow: \n *" });
});


// servir estatico
app.use(express.static(path.join(__dirname, '/files/public/static')))

// set port, listen for requests
main_routing(app);
dmsm_routing(app)

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
//https.createServer({ key, cert }, app).listen(3000);

