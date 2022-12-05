import {Express} from "express";
import WebSocket, {WebSocketServer} from 'ws';
import { parse } from 'url';

// TODO: // Continuar caso queira proxificar o WebSocket do Scraper

export function setup(app: Express) {
    const WSSRelay = new WebSocketServer({port: 9080})
    const WSProgress = new WebSocketServer({noServer: true})
    const WSProxyHealth = new WebSocketServer({noServer: true})
    interface UserPathStatus {
        uid: number,
        scraper_addr: string,
        enabled: boolean

    }
    interface WSSStatus {
        progress: Array<UserPathStatus>,
        proxyhealth: boolean
    }

    let WSSStatus: WSSStatus = {
        progress: [],
        proxyhealth: false
    }

    WSProgress.on('connection', function connection(ws) {
        ws.on('message', function message(data) {
            console.log(data)
        })
    })

    WSSRelay.on('upgrade', (request, socket, head)=> {
    const { pathname } = parse(request.url);
    if (pathname === '/progress') {
        WSProgress.handleUpgrade(request, socket, head, function done(ws) {
        WSProgress.emit('connection', ws, request);
        });
    }
    if (pathname === '/proxyhealth') {
        WSProxyHealth.handleUpgrade(request, socket, head, function done(ws) {
        WSProxyHealth.emit('connection', ws, request);
        })
    }
    })
    app.set('WSSRelay', WSSRelay)
    app.set('WSSStatus', WSSStatus)
}