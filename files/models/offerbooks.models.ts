import { RowDataPacket } from 'mysql2'
import { Express } from 'express'
import mysql from 'mysql2'
import { User } from '../exports/global.exports'

export async function get_dmsm(user: User, app: Express) {
    let pool = <mysql.Pool> app.get('db_pool')
    let res = <any> await pool.promise().query("SELECT dm_sm FROM `cached_offerbooks` WHERE (uid = ?);", [user.id])
    
    if( Object.keys(res[0]).length === 0 ) {
        return {}
    }
    return typeof res[0][0] === typeof "" ? JSON.parse(res[0][0]).dm_sm: res[0][0].dm_sm
}

export async function get_g2gsdb(user: User, app: Express) {
    let pool = <mysql.Pool> app.get('db_pool')
    let res = <any> await pool.promise().query("SELECT g2g_sdb FROM `cached_offerbooks` WHERE (uid = ?);", [user.id])
    
    if( Object.keys(res[0]).length === 0 ) {
        return {}
    }
    return typeof res[0][0] === typeof "" ? JSON.parse(res[0][0].g2g_sdb): res[0][0].g2g_sdb
}

export async function get_both_d_g(user: User, app: Express) {
    let pool = <mysql.Pool> app.get('db_pool')
    let res = <any> await pool.promise().query("SELECT dm_sm, g2g_sdb FROM `cached_offerbooks` WHERE (uid = ?);", [user.id])
    
    if( Object.keys(res[0]).length === 0 ) {
        return []
    }
    return [typeof res[0][0] === typeof "" ? JSON.parse(res[0][0]): res[0][0], typeof res[0][1] === typeof "" ? JSON.parse(res[0][1]): res[0][1]]
}


export async function set_dmsm(user: User, offerbook: string, app: Express) {
    let pool = <mysql.Pool> app.get('db_pool')
    let res = await pool.promise().query("UPDATE `ecogaming`.`cached_offerbooks` SET `dm_sm` = ? WHERE (`uid` = ?);", [offerbook, user.id])
    
    console.table(res)

    
}

export async function set_g2gsdb(user: User, offerbook: string, app: Express) {
    let pool = <mysql.Pool> app.get('db_pool')
    let res = await pool.promise().query("UPDATE `ecogaming`.`cached_offerbooks` SET `g2g_sdb` = ? WHERE (`uid` = ?);", [offerbook, user.id])
    
    console.table(res)
}

