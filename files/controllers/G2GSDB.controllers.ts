import request from 'request';
import { Response as RResponse } from 'request';
import {Request, Response } from 'express'
import { G2GScraper } from '../config/endpoints.config'
import { url_make } from '../config/endpoints.config';




export function req_updated_orders(req : Request, res: Response) {
    
    request(url_make(G2GScraper.port, G2GScraper.paths.GET.OfferBook), function (error: any, response: RResponse, body) {

        console.error('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); 

    });
    
}