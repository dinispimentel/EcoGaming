import {Request as ERequest, Response as EResponse, Express} from 'express'
import { retrieve_flash_config } from '../controllers/utilities.controllers'

const PREFIX = "/utils/"

export function routing(app : Express) {
    app.post(PREFIX + "flash-config", (req: ERequest, res: EResponse) => {retrieve_flash_config(req, res, app)})
}