
export const _protocol = "http://"
export const _domain = "192.168.0.120"

export const G2GScraper = {
    port: 8081,
    paths: {

        GET: {
            BestDeals: "bestdeals",
            Status: "status"
        },

        POST: {
            ScanBrands: "check-new-brands",
            Brand: "brand-it",
            Price: "g2g-price-it",
            SteamAppID: "steam-app-id-it",
            SteamPrice: "steam-price-it",
            BlackListAdd: "blacklist-add"
        }
        
    }

}

export const DMSMScraper = {
    port: 8082,
    paths: {
        GET: {
            BestDeals: "bestdeals",
            Status: "status"
            
        },
        POST : {
            UpdateDMarket: "updateInternalDMarketData",
            ItemNaming: "itemNameId",
            ItemPricing: "itemPrice"
        },
        WS : {
            Progress: "progress",
            ProxyHealth: "proxyhealth"
        }
    }
}

export function url_make(port: number, path: string, domain?: string) {  // urlMake está segregado para caso seja preciso ver a existência de "//" adicionais no meio do path

    return _protocol + (domain || _domain) + ":" + port + "/" + path
}