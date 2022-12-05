
// import {pool} from './db'
import { RowDataPacket } from 'mysql2'
import {compare} from 'bcrypt'
import { UserNotFoundError, NoScraperConfigFoundError } from '../classes/global.classes'
import { ScraperAddr, User } from '../exports/global.exports'
import { Express } from 'express'
import mysql from 'mysql2'


interface IUser extends RowDataPacket {
    id : number,
    username : string,
    password : string,
    avatar: string
} 
interface IScraperAddr extends RowDataPacket {
    host: string
    wsport: number 
}

// IGNORAR interface IUser extends Array<IUser> {}  // Junta o login_res[] ao login_res como sendo um só

export async function verifyAuth(username : string, passwd : string, app: Express) {
    // let passwd = bEncryptPass(un_salted_password)
    let pool = <mysql.Pool> app.get('db_pool')
    let res = await pool.promise().query<IUser[]>("SELECT id, username, avatar, password FROM logins where username = ?;", [username])
    if (Object.keys(res[0]).length === 0 || res[0].length === 0) {
        console.log("Throwing ")
        throw new UserNotFoundError("user not found")
    } 
    console.log("Not Throwing ")
    console.log ("res 0" + res[0])
    console.log ("res 1" + res[1])
    console.table(res[0])
    console.log("psswd: " + passwd)
    console.log("dbpswd: " + res[0][0].password) 
    if (await compare(passwd, res[0][0].password)) {
        return new User(res[0][0].id, res[0][0].avatar, res[0][0].username)
    } else {
        return false
    }
    
}

export async function initUserScraperAddr(user: User, app: Express){
    let pool = <mysql.Pool> app.get('db_pool')
    let res = await pool.promise().query<IScraperAddr[]>("SELECT host, wsport FROM scraper_config WHERE id = ?;", [user.id])
    if (Object.keys(res[0]).length === 0 || res[0].length === 0) {
        console.log("Throwing ");
        throw new NoScraperConfigFoundError("scraper config not found");
    }
    console.log("User received", user)
    user.scraper_addr = new ScraperAddr(res[0][0].host, res[0][0].wsport)
}



/*

if (rs[0].username == username && rs[0].password = passwd)   

*/