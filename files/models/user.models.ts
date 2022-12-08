
// import {pool} from './db'
import { RowDataPacket } from 'mysql2'
import {compare} from 'bcrypt'
import { UserNotFoundError, NoScraperConfigFoundError, NoFlashConfigFoundError} from '../classes/global.classes'
import { FC_UIDM, FlashConfig, ScraperAddr, User } from '../exports/global.exports'
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
interface IFlashConfig extends RowDataPacket {
    update_internal_dmarket?: string
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
    
    user.scraper_addr = new ScraperAddr(res[0][0].host, res[0][0].wsport)
}

function is_flash_config(str: string){
    
    let fcs = ["update_internal_dmarket"]
    for (let f=0; f<fcs.length; f++) {
        if (fcs[f] == str) return true;
    }
    throw new Error("Script error, config asked doesn't exist.")
}


export async function get_flash_config(user: User, config_col: string, app: Express): Promise<FlashConfig> {
    let pool = <mysql.Pool> app.get('db_pool')
    is_flash_config(config_col)
    let res = await pool.promise().query<IFlashConfig[]>("SELECT "+ config_col +" FROM flash_user_config WHERE uid = ?;", [user.id])
    if (Object.keys(res[0]).length === 0 || res[0].length === 0) {
        console.log("No flash config", user.id)
        throw new NoFlashConfigFoundError("flash config not found")
    } 
    let fc = <FlashConfig> {}
    if (res[0][0].update_internal_dmarket) {
        fc.update_internal_dmarket = <FC_UIDM> (typeof res[0][0].update_internal_dmarket === 'object' ? res[0][0].update_internal_dmarket : JSON.parse(res[0][0].update_internal_dmarket))
    }
    return fc
}   

export async function save_flash_config(user: User, config_col: string, newjson: string, app: Express): Promise<void> {
    let pool = <mysql.Pool> app.get('db_pool')
    is_flash_config(config_col)
    let res = await pool.promise().query("UPDATE `ecogaming`.`flash_user_config` SET `"+ config_col +"` = ? WHERE (uid = ?);", [newjson, user.id])
    console.table(res)
}

/*

if (rs[0].username == username && rs[0].password = passwd)   

*/