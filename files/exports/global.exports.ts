import { Session } from "express-session";


export interface LoggedStatus {
    isLogged : boolean
}

export interface UserInfo {
    UserId : number,
    Avatar : string
}

export interface OfferBookColection {
    DMSM : object,
    G2GSDB : object
}

export interface SettingsCollection {
    GeneralSettings: object,
    DMSMSettings: object,
    G2GSDBSettings: object,
    ExRatesSettings: object
}

export class User {
    id: number
    avatar: string
    username: string
    scraper_addr?: ScraperAddr

    constructor(id : number, avatar: string, username : string) {
        this.id = id
        this.avatar = avatar
        this.username = username
    }

    

}

export class ScraperAddr {
    host: string
    wsport: number 
    constructor (host: string, wsport: number) {
        this.host = host
        this.wsport = wsport
    }
}


declare module 'express-session' {
    export interface SessionData {
        LoggedStatus : LoggedStatus,
        User : User,
        OfferBooks: OfferBookColection,
        Settings: SettingsCollection
    }
}

export default {}