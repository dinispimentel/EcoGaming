
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

export function check_authed(req: Request, res: Response, redir_path_after_login: string, shouldNotRedirect?: boolean, api_route?: boolean) : boolean{
    /**
     * @returns should_proceed: boolean
     */
    let sNRedir = shouldNotRedirect === true
    
    if (req.session.LoggedStatus && req.session.LoggedStatus.isLogged && req.session.User) {
        console.log("Session expiraty before: " + req.session.cookie.maxAge);
        req.session.resetMaxAge();
        console.log("Session expiraty after: " + req.session.cookie.maxAge);
        return true;
    } else {
        let redir_path = "/login"
        res.status(403)
        if (check_was_logged_in(req, res)) {
            redir_path = "/session-expired?redirto=" + redir_path_after_login;
        }
        if (!sNRedir) {
            res.redirect(redir_path);
        } else if (api_route){
            res.json({success: false, msg: "not allowed"})
        }
        return false;
    }

}

export function check_scrap_able (req: Request, res: Response) {
    if (req.session.User?.scraper_addr?.host === undefined || req.session.User?.scraper_addr?.host === null) {
        res.status(403)
        res.render("errors/general.ejs", {info: JSON.stringify(req.session.User), error_code: "NO_SCRAPER_CONFIG_GIVEN_ERROR"})
        return false
    } else {
        return true
    }
}