import request from 'request';
import { Response as RResponse } from 'request';
import { Request as ERequest, Response as EResponse, Express } from 'express'
import { G2GScraper } from '../config/endpoints.config'
import { url_make } from '../config/endpoints.config';
import { fetch_scraper } from './defaultscraper.controllers';
import { initUserScraperAddr, save_flash_config } from '../models/user.models';
import { check_authed, check_scrap_able } from './enforceauth.controllers';
import { NoScraperConfigFoundError } from '../classes/global.classes';



export function req_best_deals(req : ERequest, res: EResponse, app: Express) {
    
    if (check_authed(req, res, "", true)) {
        if (check_scrap_able(req, res)) {
            try {
                req.body.sort_direction = Number(req.body.sort_direction)
                req.body.offset = Number(req.body.offset)
                req.body.offer_count = Number(req.body.offer_count)
                fetch_scraper(req, res, 0, G2GScraper.paths.GET.BestDeals, "GET", undefined, req.body, (body: any) => {
                    if (req.session.User) {
                        save_flash_config(req.session.User, 'retrieve_best_deals_g2gsdb', JSON.stringify(req.body), app)    
                    }
                    if (body instanceof Object) {
                        if (req.session.OfferBooks === undefined) {
                            req.session.OfferBooks = {
                                DMSM: {},
                                G2GSDB: {}
                            }
                        }
                        req.session.OfferBooks.G2GSDB = body.offerbook
                        req.session.save()
                        console.table(req.session.OfferBooks)
                    }
                    
                });
            } catch {
                res.status(500).json({success: false, msg: "Error casting types"})
            }
        }
        
    }
    
}

export function scraper_status(req: ERequest, res: EResponse) {
    if (check_authed(req, res, "", true)) {
        if (check_scrap_able(req, res)) {
            fetch_scraper(req, res, 0, G2GScraper.paths.GET.Status, "GET")
        }
    }
}

export function scraper_brand_scan(req: ERequest, res: EResponse) {
    if (check_authed(req, res, "", true)) {
        if (check_scrap_able(req, res)) {
            fetch_scraper(req, res, 0, G2GScraper.paths.POST.ScanBrands, "POST")
        }
    }
}

export function scraper_brand (req: ERequest, res: EResponse) {
    if (check_authed(req, res, "", true)) {
        if (check_scrap_able(req, res)) {
            try {
                if (req.body.min_offers !== undefined && req.body.min_offers !== null) req.body.min_offers = Number(req.body.min_offers);
                fetch_scraper(req, res, 0, G2GScraper.paths.POST.Brand, "POST", undefined, req.body)

            } catch {
                res.status(500).json({success: false, msg: "Error casting types"})
            }
            
        }
    }
}

export function scraper_price (req: ERequest, res: EResponse) {
    if (check_authed(req, res, "", true)) {
        if (check_scrap_able(req, res)) {
            
            fetch_scraper(req, res, 0, G2GScraper.paths.POST.Price, "POST", undefined, req.body)
            
        }
    }
}

export function scraper_app_id (req: ERequest, res: EResponse) {
    if (check_authed(req, res, "", true)) {
        if (check_scrap_able(req, res)) {
            
            fetch_scraper(req, res, 0, G2GScraper.paths.POST.SteamAppID, "POST")
            
        }
    }
}

export function scraper_app_price (req: ERequest, res: EResponse) {
    if (check_authed(req, res, "", true)) {
        if (check_scrap_able(req, res)) {
            
            fetch_scraper(req, res, 0, G2GScraper.paths.POST.SteamPrice, "POST", undefined, req.body)
            
        }
    }
}

export function scraper_blacklist_add (req: ERequest, res: EResponse) {
    if (check_authed(req, res, "", true)) {
        if (check_scrap_able(req, res)) {
            
            fetch_scraper(req, res, 0, G2GScraper.paths.POST.BlackListAdd, "POST", undefined, req.body)
            
        }
    }
}

export async function load_g2g_deals(req: ERequest, res: EResponse, app: Express) {
    if (check_authed(req, res, "g2g-deals", false)) {
        try {
            function _render() {
                
                res.render("pages/g2g_deals.ejs", {offerbook: req.session.OfferBooks?.G2GSDB, id: req.session.User?.id || -1, avatar: req.session.User?.avatar || 
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