import {Request as ERequest, Response as EResponse, Express} from 'express'
import { load_settings } from '../controllers/settings.controllers'


const PREFIX = "/settings-api/"

export function routing(app : Express) {

    // API
    app.post(PREFIX + "flash-config",)


    // Main Page
    app.get("/settings", (req: ERequest, res: EResponse) => {load_settings(req, res, app)})
}