import request from 'request';
import { Response as RResponse } from 'request';
import { Request as ERequest, Response as EResponse, Express } from 'express'
import { DMSMScraper, url_make } from '../config/endpoints.config';
import { fetch_scraper } from './defaultscraper.controllers';
import { check_authed, check_scrap_able } from './enforceauth.controllers';
import { get_settings } from '../models/user.models';


export async function load_settings(req: ERequest, res: EResponse, app: Express) {
    if (check_authed(req, res, "settings", false)) {
        try {
            function _render() {
                res.render("settings.ejs", {offerbook: null, id: req.session.User?.id || -1, avatar: req.session.User?.avatar || 
                    "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
                    username: req.session.User?.username
                });
            }
            if (req.session.User) {
                req.session.Settings = <any> await get_settings(req.session.User, ["general-settings", "dmsm-settings", "g2gsdb-settings", "exrates-settings"], app);
                console.log("Settings inited: " + String(req.session.Settings));
                _render()
            } 
            
        } catch (error) {
            
            res.render("errors/general.ejs", {info: JSON.stringify(req.session.User), error_code: "UNKNOWN_CAUSE"})
            
        } 
    }
}
