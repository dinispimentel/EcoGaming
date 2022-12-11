import request from 'request';
import { Response as RResponse} from 'request';
import { Request as ERequest, Response as EResponse} from 'express'
import {DMSMScraper, G2GScraper, url_make } from '../config/endpoints.config';



function _deal_with_request(error: Error, response: RResponse, body: any, res: EResponse, allokcb?: CallableFunction) {
    try {
        body = JSON.parse(body);
    } catch {
         
    }
    
    try {
        if (error !== null) {
            console.error('error:', error); // Print the error if one occurred
            console.table(error)
            if ((<any> error).code && (<any> error).code === 'ECONNREFUSED') {
                console.log("Here")
                res.status(500).json({success: false, msg: "Couldn't forward connection"})
            } 
        } else {
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            console.log('body:', body); 
            res.status(response.statusCode).json({
                success: (response.statusCode !== undefined && response.statusCode !== null) ? 
                response.statusCode <= 200 : false, 
                msg: (body !== undefined ? ( typeof body === typeof "" ? body : ('msg' in body ? body.msg : body)) : null)
            });
            if (allokcb && response.statusCode === 200) {
                allokcb()
            }
            
        }
        
    } catch (error) {
        console.log("deal request high error", error)
        res.status(500).json({success: false, msg: 
                (body !== undefined ? ( typeof body === typeof "" ? body : ('msg' in body ? body.msg : body)) : null)
            });
    }
}

type CallbackFunction =
  (error: Error, response: RResponse, body: any, res: EResponse, allokcb?: CallableFunction) => void;

function request_with_method(urlQueryParametrized: string, method: string, body: any, res: EResponse, cb: CallbackFunction, allokcb?: CallableFunction) {
    let normalized_callback = (error: Error, response: RResponse, body: any) => {cb(error, response, body, res, allokcb)};
    
    interface NormalRequest {
        headers: object,
        url: string
        body?: string
    }
    let normalized_req: NormalRequest = {
        headers: {'content-type' : 'application/json'},  
        url:     urlQueryParametrized
    }
    
    if (body !== undefined && body !== null) {
        normalized_req.body = JSON.stringify(body)
    }
    

    
    switch (method){
        case "get":
            request.get(normalized_req, normalized_callback);
            break;
        case "put":
            request.put(normalized_req, normalized_callback);
            break;
        case "post":
            request.post(normalized_req, normalized_callback);
            break;
        case "patch":
            request.patch(normalized_req, normalized_callback);
            break;
        default:
            throw Error("Method to scraper request is not in cases: " + String(method));
            
    }
    

}


export function fetch_scraper(req: ERequest, res: EResponse, scraper: number, path: string, method: string, query_params?: Array<string>, req_body?: object, allokcb?: CallableFunction) {
    /**
     * @param scraper `0` -> G2GSDB; `1` -> DMSM
     */
    method = String(method).toLowerCase()
    switch (scraper) {
        case 0:
            request_with_method(url_make(G2GScraper.port, path, req.session.User?.scraper_addr?.host), method, req_body, res,_deal_with_request, allokcb);
            break;
        case 1:
            request_with_method(url_make(DMSMScraper.port, path, req.session.User?.scraper_addr?.host), method, req_body, res, _deal_with_request, allokcb);
            break
        default:
            throw Error("SCRAPER INDICATED OUT OF RANGE: " + String(scraper))
    }

}
