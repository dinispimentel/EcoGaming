
import {Request as ERequest, Response as EResponse, Express} from 'express'

import {load_g2g_deals, req_best_deals, scraper_app_id, scraper_app_price, scraper_blacklist_add, scraper_brand, scraper_brand_scan, scraper_price, scraper_status} from '../controllers/G2GSDB.controllers'
const PREFIX = "/g2gsdb/"

export function routing(app : Express) {

  // API Routes
  
  app.post(PREFIX + "status", scraper_status)

  app.post(PREFIX + "scan-games", scraper_brand_scan)
  
  app.post(PREFIX + "brand-games", scraper_brand)
  app.post(PREFIX + "price-games", scraper_price)

  app.post(PREFIX + "steam-appid-games", scraper_app_id)
  app.post(PREFIX + "steam-price-games", scraper_app_price)

  app.post(PREFIX + "best-deals", (req: ERequest, res: EResponse) => {req_best_deals(req, res, app)})
  
  app.post(PREFIX + "blacklist-add", scraper_blacklist_add)
  //

  app.get('/g2g-deals', (req: ERequest, res: EResponse) => {load_g2g_deals(req, res, app)});
  
  

  
}