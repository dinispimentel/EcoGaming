import { Request as ERequest, Response as EResponse, Express} from 'express'
import { check_authed } from './enforceauth.controllers'
import { get_flash_config } from '../models/user.models'
import { NoFlashConfigFoundError } from '../classes/global.classes'

export async function retrieve_flash_config (req: ERequest, res: EResponse, app: Express) {
    if (check_authed(req, res, "", true) && req.session.User) {
        try {
            if (!req.body.config) throw Error("param missing-> config: string");
            let fc = await get_flash_config(req.session.User, req.body.config, app)
            res.json({success: true, flash_config: fc})
        } catch (error) {

            if (error instanceof NoFlashConfigFoundError) {
                res.status(404);
                res.json({success: false, msg: "flash config not found"});
            } else {
                res.status(500)
                res.json({success: false, msg: "config not found on server."})
            }
            
        }
        
        
    }
}