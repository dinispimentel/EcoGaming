import request from 'request';
import { Response as RResponse } from 'request';
import { Request as ERequest, Response as EResponse, Express } from 'express'
import { DMSMScraper, url_make } from '../config/endpoints.config';
import { fetch_scraper } from './defaultscraper.controllers';
import { check_authed, check_scrap_able } from './enforceauth.controllers';
import { initUserScraperAddr, save_flash_config } from '../models/user.models';
import { NoScraperConfigFoundError } from '../classes/global.classes';
import { get_dmsm, set_dmsm } from '../models/offerbooks.models';


export function req_best_deals(req : ERequest, res: EResponse, app: Express) {
    if (check_authed(req, res, "", true, true)) {
        if (check_scrap_able(req, res)) {
            try {
                req.body.sort_direction = Number(req.body.sort_direction)
                req.body.offset = Number(req.body.offset)
                req.body.offer_count = Number(req.body.offer_count)
                fetch_scraper(req, res, 1, DMSMScraper.paths.GET.BestDeals, "GET", undefined, req.body, (body: any) => {
                    if (req.session.User) {
                        save_flash_config(req.session.User, 'retrieve_best_deals_dmarket', JSON.stringify(req.body), app)    
                        if (body instanceof Object) {
                        
                        
                            set_dmsm(req.session.User, JSON.stringify(body.offerbook), app)
                            
                        }
                    }
                    
                });
            } catch {
                res.status(500).json({success: false, msg: "Error casting types"})
            }
        }
    }

}   // ISTO É USADO NO SERVER SIDE COMO PROXY A MASCARAR O SCRAPER PYTHON

export function update_scraper_dmarket(req: ERequest, res: EResponse, app: Express) {
    if (check_authed(req, res, "", true, true)) {
        if (check_scrap_able(req, res)) {
            try {
                req.body.limit = Number(req.body.limit)
                req.body.offset = Number(req.body.offset)
                req.body.priceFrom = Number(req.body.priceFrom)
                req.body.priceTo = Number(req.body.priceTo)
                req.body.maxLimit = Number(req.body.maxLimit)
                console.log("To fetch body: ", req.body)
                fetch_scraper(req, res, 1, DMSMScraper.paths.POST.UpdateDMarket, "POST", undefined, req.body, (body: any) => {
                    if (req.session.User) {
                        save_flash_config(req.session.User, 'update_internal_dmarket', JSON.stringify(req.body), app)    
                    }
                    
                });
            } catch {
                res.status(500).json({success: false, msg: "Error casting types"})
            }
        }
    }
}

export function scraper_status(req: ERequest, res: EResponse) {
    if (check_authed(req, res, "", true, true)) {
        if (check_scrap_able(req, res)) {
            fetch_scraper(req, res, 1, DMSMScraper.paths.GET.Status, "GET")
        }
    }
}

export function scraper_item_name(req: ERequest, res: EResponse, app: Express) {
    console.log("item naming received, auth? " + req.cookies['connect.sid'])
    if (check_authed(req, res, "", true, true)) {
        if (check_scrap_able(req, res)) {
            if(check_authed(req, res, "", true)) {
                
                fetch_scraper(req, res, 1, DMSMScraper.paths.POST.ItemNaming, "POST")
                
            }
        }
    }
}

export function get_scraper_addr(req: ERequest, res: EResponse) {
    if (check_authed(req, res, "", true, true)) {
        if (check_scrap_able(req, res)) {
            if (check_authed(req, res, "", false)) {
                res.json({success: true, host: req.session.User?.scraper_addr?.host, port: req.session.User?.scraper_addr?.wsport})
            }
        }
    }
}

export function scraper_item_price(req: ERequest, res: EResponse) {
    if (check_authed(req, res, "", true, true)) {
        if (check_scrap_able(req, res)) {
            fetch_scraper(req, res, 1, DMSMScraper.paths.POST.ItemPricing, "POST", undefined, req.body)
        }
    }
}

export async function retrieve_cache_offerbook(req: ERequest, res: EResponse, app: Express) {
    if (check_authed(req, res, "", true)) {
        if (check_scrap_able(req, res)) {
            res.json(req.session.User === undefined ? {} : await get_dmsm(req.session.User, app))
        }
    }
}


export async function load_darket_deals(req: ERequest, res: EResponse, app: Express) {

    if (check_authed(req, res, "dmarket-deals", false)) {
        try {
            function _render() {
                res.render("pages/dmarket_deals.ejs", {offerbook: req.session.OfferBooks?.DMSM, id: req.session.User?.id || -1, avatar: req.session.User?.avatar || 
                    "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png",
                    username: req.session.User?.username
                });
            }
            if (req.session.User && req.session.User.scraper_addr === undefined) {
                console.log("Pre", req.session.User)
                await initUserScraperAddr(req.session.User, app);
                console.log("Scraper Addr inited: " + String(req.session.User?.scraper_addr));
                console.log("Post", req.session.User);
                _render()
            
            } else {
                console.log("Scraper Addr was already inited.")
                _render()
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