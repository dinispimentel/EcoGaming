
import { req_best_deals, load_darket_deals, update_scraper_dmarket, scraper_status, scraper_item_name, scraper_item_price, get_scraper_addr, retrieve_cache_offerbook} from "../controllers/DMSM.controllers";
import {Request as ERequest, Response as EResponse, Express} from 'express'
const PREFIX = "/dmsm/"

export function routing(app : Express) {
 
    // Prefixed (SCRAPER API CALLS PROXIFIED)
    
    app.get(PREFIX + "status", scraper_status)
    app.get(PREFIX + "websocket-addr", get_scraper_addr)
    app.post(PREFIX + "bestdeals", (req: ERequest, res: EResponse) => {req_best_deals(req, res, app)})
    app.post(PREFIX + "update-dmarket-data", (req: ERequest, res: EResponse) => {update_scraper_dmarket(req, res, app)})
    app.post(PREFIX + "item-naming", (req: ERequest, res: EResponse) => {scraper_item_name(req, res, app)})
    app.post(PREFIX + "item-pricing", scraper_item_price)
    
    // #\
    app.get(PREFIX + "cache-offerbook", async (req: ERequest, res: EResponse) => {await retrieve_cache_offerbook(req, res, app)})
    
    app.get("/dmarket-deals", async (req: ERequest, res: EResponse) => {await load_darket_deals(req, res, app)})
    

};
 