import {login_or_dashboard, load_login, load_dashboard, load_session_expired, attempt_login} from "../controllers/login-page.controllers";
import { req_best_deals } from "../controllers/G2GSDB.controllers";
import {Express} from 'express'
export function routing(app : Express) {
 


  app.get("/", login_or_dashboard);
  app.get("/dashboard", load_dashboard);
  app.get("/login", load_login);
  app.get("/session-expired", load_session_expired)
  
  

  app.post("/login-attempt", attempt_login)

};
 