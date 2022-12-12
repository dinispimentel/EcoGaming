
// import {pool} from './db'
import { RowDataPacket } from 'mysql2'
import {compare} from 'bcrypt'
import { UserNotFoundError, NoScraperConfigFoundError, NoFlashConfigFoundError} from '../classes/global.classes'
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
interface IFlashConfig extends RowDataPacket {
    update_internal_dmarket?: string
    retrieve_best_deals_dmarket?: string
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
    
    let fcs = ["update_internal_dmarket", "retrieve_best_deals_dmarket", "retrieve_best_deals_g2gsdb"]
    for (let f=0; f<fcs.length; f++) {
        if (fcs[f] === str) return true;
    }
    throw new Error("Script error, config asked doesn't exist.")
}

function is_setting(str: string) {
    let settings = ["general-settings", "dmsm-settings", "g2gsdb-settings", "exrates-settings"]
    for (let s=0; s<settings.length; s++) {
        if (settings[s] === str) return true;
    }
    throw new Error("Script error, setting asked doesn't exist.")
}

export async function get_flash_config(user: User, config_col: string, app: Express){
    let pool = <mysql.Pool> app.get('db_pool')
    is_flash_config(config_col)
    let res = await pool.promise().query<IFlashConfig[]>("SELECT "+ config_col +" FROM flash_user_config WHERE uid = ?;", [user.id])
    if (Object.keys(res[0]).length === 0 || res[0].length === 0) {
        console.log("No flash config", user.id)
        throw new NoFlashConfigFoundError("flash config not found")
    } 
    let fc = {}
    if (res[0][0][config_col]) {
        
        (<any> fc)[config_col] = (typeof res[0][0][config_col] === 'object' ? res[0][0][config_col] : JSON.parse(res[0][0][config_col]))
    }
    return fc
}   

export async function save_flash_config(user: User, config_col: string, newjson: string, app: Express): Promise<void> {
    let pool = <mysql.Pool> app.get('db_pool')
    is_flash_config(config_col)
    let res = await pool.promise().query("UPDATE `ecogaming`.`flash_user_config` SET `"+ config_col +"` = ? WHERE (uid = ?);", [newjson, user.id])
    console.table(res)
}

export async function get_settings(user: User, settings: string[] | string, app: Express) {
    let pool = <mysql.Pool> app.get('db_pool')
    if (typeof settings === typeof "") {
        settings = [<string> settings]
    }
    let settings_list: string = ""
    for (const setting of settings) {
        is_setting(setting)
        settings_list = settings_list + setting + ","
    }
    settings_list = settings_list.slice(0, settings_list.length-1)
    
    let res = <any> await pool.promise().query('SELECT ' + settings_list + " FROM `settings` WHERE (uid = ?);", [user.id])
    let set_ret: Array<object> = []

    for (const setting of settings) {
        if (res[0][0][setting]) {
            (<any> set_ret)[setting] = ( typeof res[0][0][setting] === 'object' ? res[0][0][setting] : ( (res[0][0][setting] === '' || res[0][0][setting] === null) ? {} : JSON.parse(res[0][0][setting])) )
        }
    }
    return set_ret
    
}

/*

if (rs[0].username == username && rs[0].password = passwd)   

*/