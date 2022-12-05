import mysql from 'mysql2'
import {dbConfig} from "../config/db.config";
import util from 'util'
// Create a connection to the database


export const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  connectionLimit : 15,
  connectTimeout: 30000
});






