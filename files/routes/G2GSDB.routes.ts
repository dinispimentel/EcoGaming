
import {Express} from 'express'

import {req_updated_orders} from '../controllers/G2GSDB.controllers'
const PREFIX = "/g2gsdb/"

export function routing(app : Express) {
 

  app.get(PREFIX + "requestG2GUpdatedOffers", );
  app.get("/updated", req_updated_orders)

  
}