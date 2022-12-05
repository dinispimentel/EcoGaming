
import {Request, Response} from 'express'

declare module 'express' {
    export interface Request {
        cookies : {
            "connect.sid": string
            wasLoggedIn? : string
        }
    }
}

function check_was_logged_in(req: Request, res: Response) : boolean{
    let wasLoggedIn = req.cookies.wasLoggedIn;

    
    return wasLoggedIn === 'true';
    
    
}

export function set_was_logged_in(req: Request, res: Response) {

    if (!check_was_logged_in(req, res)) {
        res.cookie("wasLoggedIn", (req.session.LoggedStatus?.isLogged) );
    } 

}

export function check_authed(req: Request, res: Response, redir_path_after_login: string, shouldNotRedirect?: boolean) : boolean{
    /**
     * @returns should_proceed: boolean
     */
    let sNRedir = shouldNotRedirect === true
    
    if (req.session.LoggedStatus && req.session.LoggedStatus.isLogged && req.session.User) {
        console.log("Session expiraty before: " + req.session.cookie.maxAge);
        req.session.resetMaxAge();
        let date = new Date();
        date.setTime(date.getTime() + req.session.cookie.originalMaxAge)
        let expire = date.toUTCString()
        console.log(expire + "|" + req.cookies["connect.sid"])
        res.setHeader('Set-Cookie', "connect.sid="+String(req.cookies["connect.sid"])+"; Expires=" + expire);
        console.log("Session expiraty after: " + req.session.cookie.maxAge);
        return true;
    } else {
        let redir_path = "/login"
        if (check_was_logged_in(req, res)) {
            redir_path = "/session-expired?redirto=" + redir_path_after_login;
        }
        if (!sNRedir) {
            res.redirect(redir_path);
        }
        return false;
    }

}