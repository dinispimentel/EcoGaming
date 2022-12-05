import request from 'request';
import { Response as RResponse } from 'request';
import { Request as ERequest, Response as EResponse, Express} from 'express'
import {DMSMScraper, url_make } from '../config/endpoints.config';
import { fetch_scraper } from './defaultscraper.controllers';
import { check_authed } from './enforceauth.controllers';
import { initUserScraperAddr } from '../models/user.models';
import { NoScraperConfigFoundError } from '../classes/global.classes';


export function req_best_deals(req : ERequest, res: EResponse) {
    

    fetch_scraper(req, res, 1, DMSMScraper.paths.GET.BestDeals, "GET");

}   // ISTO É USADO NO SERVER SIDE COMO PROXY A MASCARAR O SCRAPER PYTHON

export function update_scraper_dmarket(req: ERequest, res: EResponse) {
    fetch_scraper(req, res, 1, DMSMScraper.paths.POST.UpdateDMarket, "POST", undefined, req.body);
}

export function scraper_status(req: ERequest, res: EResponse) {
    fetch_scraper(req, res, 1, DMSMScraper.paths.GET.Status, "GET")
}

export function scraper_item_name(req: ERequest, res: EResponse, app: Express) {
    if(check_authed(req, res, "", false)) {
        
        fetch_scraper(req, res, 1, DMSMScraper.paths.POST.ItemNaming, "POST")
        
    }
    
}

export function scraper_item_price(req: ERequest, res: EResponse) {
    fetch_scraper(req, res, 1, DMSMScraper.paths.POST.ItemPricing, "POST", undefined, req.body)
}



    



export async function load_darket_deals(req: ERequest, res: EResponse, app: Express) {

    if (check_authed(req, res, "dmarket-deals", false)) {
        try {
            if (req.session.User && req.session.User.scraper_addr === undefined) {
                console.log("Pre", req.session.User)
                await initUserScraperAddr(req.session.User, app);
                console.log("Scraper Addr inited: " + String(req.session.User?.scraper_addr));
                console.log("Post", req.session.User);
                res.render("pages/dmarket_deals.ejs", {previous_data: null, id: req.session.User?.id || -1, avatar: req.session.User?.avatar || 
                    "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
                    username: req.session.User?.username
                });
            
                

            } else {
                console.log("Scraper Addr was already inited.")
                res.render("pages/dmarket_deals.ejs", {previous_data: null, id: req.session.User?.id || -1, avatar: req.session.User?.avatar || 
                    "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
                    username: req.session.User?.username
                });
            }
            
        } catch (error) {
            if (error instanceof NoScraperConfigFoundError) {
                res.render("errors/general.ejs", {info: JSON.stringify(req.session.User), error_code: "NO_SCRAPER_CONFIG_FOUND_ERROR"})
            } else {
                res.render("errors/general.ejs", {info: JSON.stringify(req.session.User), error_code: "UNKNOWN_CAUSE"})
            }
        } 
        
    } 

}