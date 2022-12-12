
import {Request, Response } from 'express';
import path from 'node:path';
import {LoggedStatus, User} from '../exports/global.exports';
import {verifyAuth} from '../models/user.models'
import { UserNotFoundError } from '../classes/global.classes'
// import {Express} from 'express'
import {app}  from '../../server';
import { check_authed, set_was_logged_in } from './enforceauth.controllers';






export function login_or_dashboard ( req : Request, res : Response) {
    
    if (check_authed(req, res, "dashboard", false)) {
        
        res.redirect("dashboard");

    } 
   
}

export function load_dashboard (req : Request, res : Response) {
    console.log("Load Dashboard init")
    if (check_authed(req, res, "dashboard", false)) {
        console.log("Load Dashboard Ok to go")
        res.render("pages/dashboard.ejs", { id: req.session.User?.id || -1, avatar: req.session.User?.avatar || 
            "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
            username: req.session.User?.username
        });

    } /* else {
        console.log("Load Dashboard Not Ok redirecting")
        console.table(req.session)
        console.table(req.session.cookie)
        res.redirect("login")
    } */
}

export function load_login ( req : Request, res : Response ) {
    
    if (check_authed(req, res, "", true)) {
        res.redirect("dashboard")
    } else {
        //attempt_login(req, res)
        res.sendFile(path.join(__dirname, "../views/static/login.html"));
    }
    
}


export async function attempt_login(req: Request, res: Response) {

    try {
        
        let login = req.body
        
        console.log("Received Username:" + login.username)
        console.log("Received Passwd:" + login.password)
        let User = await verifyAuth(login.username, login.password, app)
        if (User) {
            // IMPORTANTE: MODIFICAÇÃO DE SESSION
            if (!req.session.LoggedStatus) {
                req.session.LoggedStatus = <LoggedStatus> {isLogged: true}
            } else {
                req.session.LoggedStatus.isLogged = true
            }
            if (!req.session.User) {
                req.session.User = <User> User
            }
            
            

            // TERMINOU DE MODIFICAR TEM DE MANDAR ALGO OU METER UM req.session.save() PQ SE NÃO, NÃO SALVA FDP
            set_was_logged_in(req, res)
            res.json("{\"success\": true}")  // Mandar algo pra salvar DEPOIS DE MODIFICAR

            console.log("After Attempt-login: " )
           
        } else {
            res.json("{\"success\": \"error\", \"msg\": \"username or password is not correct\"}")
        }
        
    } catch (error) {

        console.log(error);
        
        if (error instanceof UserNotFoundError) {
            res.json("{\"success\": false, \"msg\": \"user not found error\"}");
        } else {
            res.json("{\"success\": false, \"msg\": \"db server-side error\"}");
        }
        
    }
    
}

export function load_session_expired(req: Request, res: Response) {
    res.sendFile(path.join(__dirname, "../views/static/session_expired.html"))
}