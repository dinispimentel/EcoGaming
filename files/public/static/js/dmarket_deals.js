import { PopUp, create_fields } from '/js/utils/form_popup.js'
import { statusCode } from '/js/utils/error_handling.js'
import { alert as nAlert, COLOR_ERROR, COLOR_INFO, COLOR_SUCCESS } from '/js/utils/notification.js'
import { connect_progress, ProgressHandler, clearRows, createHeader, http_code_to_color, http_code_to_header, show_table_deals,
    convert_fielding_to_object, serverError } from '/js/utils/deals.js'

const UpdateDMarketData = document.getElementById('remote-update-dmarket')
const ItemNamit = document.getElementById('remote-item-nameit')
const ItemPriceit = document.getElementById('remote-item-priceit')
const RetrieveBestDeals = document.getElementById('remote-retrieve-deals')
const ProgressBar = document.getElementById('progress-bar-remote')
const TableDeals = document.getElementById('table-deals')

const _PROTOCOL = String(window.location).split("//")[0] + "//"
const PREFIX = "/dmsm/"
const _HOST = (String(window.location).substring(0,5) === "http:" ? String(window.location).split("/")[2] : "ecogaming.ga")
console.log ("HOST", _HOST)

const NOTIFICATION_TIMEOUT = 6000
var OFFERBOOK = {}


function buy_item(id) {
    // nAlert("Trying to buy: " + String(id))
    // TODO:// ASK TO CONFIRM 
    let allow_to_buy = confirm("Do you really wish to buy ... ?")
    
    // TODO:// SEND SERVER REQUEST TO BUY ITEM (PREMIUM ONLY)
    console.log("Allow to buy: ", allow_to_buy)
}



function offer_diffs(dm_price, sm_price, histogram) {
    let inst_price_gap = Number(sm_price - dm_price).toFixed(2)
    let mid_price_gap = histogram.buy_offer_book.length>0 && histogram.sell_offer_book.length>0 ?
    (((Number(histogram.sell_offer_book[0][0]) + Number(histogram.buy_offer_book[0][0]))/2) - dm_price).toFixed(3): 2**31
    let ask_price_gap = Number(histogram.ask - dm_price).toFixed(2)
    return [inst_price_gap, mid_price_gap, ask_price_gap]
}

function fill_table_offerbook(offerbook) {
    clearRows()
    for (let o=0; o<offerbook.offers.length; o++) {
        let table_row = TableDeals.insertRow(-1)
        let offer = offerbook.offers[o]
        let dm_price = Number(offer.dm_price.cValue || offer.dm_price.value)
        let sm_price = Number(offer.sm_price.cValue || offer.sm_price.value)
        let offer_diff = offer_diffs(dm_price, sm_price, offer.histogram)
        let instant_price_gap = offer_diff[0]
        let mid_price_gap = offer_diff[1]
        let ask_price_gap = offer_diff[2]
        let currency = String((offer.dm_price.cCurrency || offer.dm_price.currency))
        currency = currency === "USD" ? "$" : (currency === "EUR" ? "€" : currency)
        let _title_header = createHeader(table_row,"", ["table-entry", "first-entry", "left-align-entry", "title-entry"])
        createHeader(table_row, String(dm_price.toFixed(2)) + 
        currency, ["table-entry", "dm-price-entry"] ) 
        createHeader(table_row, String(sm_price.toFixed(2)) + 
        currency, ["table-entry", "sm-price-entry"])
        createHeader(table_row, 
            `${instant_price_gap}${currency}`+ " | " + 
            `${mid_price_gap}${currency}` + " | " +
            `${ask_price_gap}${currency}` 
        , ["table-entry", "gain-diff-entry"])
        createHeader( table_row,
            `${Number((instant_price_gap/dm_price)*100).toFixed(2)}`+ "%" + " | " +
            `${Number((mid_price_gap/dm_price)*100).toFixed(2)}`+ "%" + " | " +
            `${Number((ask_price_gap/dm_price)*100).toFixed(2)}`+ "%"
        , ["table-entry", "gain-percentage-entry"])
        
        

        let _steam_market_icon = document.createElement('i')
        _steam_market_icon.classList.add('fa-solid', 'fa-arrow-up-right-from-square', "icon-link")
        let _steam_market_link = document.createElement('a')
        _steam_market_link.setAttribute('href', "https://steamcommunity.com/market/listings/730/" + offer.title)
        _steam_market_link.innerText = offer.title
        _steam_market_link.appendChild(_steam_market_icon)
        _steam_market_link.classList.add('anchor-entry')
        _steam_market_link.setAttribute('target', '_blank')
        _title_header.appendChild(_steam_market_link)
        /* let _buy_header = table_row.insertCell(-1) // diferenciado
        let _buy_link = document.createElement('a') */
        // _buy_link.setAttribute('onclick', `buy_item("${offer.itemId}")`)
        /* _buy_link.onclick = () => {buy_item(offer.itemId)}
        _buy_link.classList.add('buy-entry-link')
        _buy_link.innerText = "Buy"
        _buy_header.appendChild(_buy_link)
        _buy_header.classList.add('buy-entry', 'table-entry') */
        let _transpose_header = table_row.insertCell(-1)
        let _transpose_checkbox = document.createElement('input')
        _transpose_checkbox.setAttribute('type', 'checkbox')
        _transpose_checkbox.id = `transpose-${offer.itemId}`
        _transpose_header.appendChild(_transpose_checkbox)
        _transpose_header.classList.add('last-entry', 'table-entry', 'transpose-entry')
        //document.getElementsByTagName('tbody').appendChild(table_row)
        
    }
}

function url_make(path) {
    let url = _PROTOCOL+_HOST+PREFIX+ path
    console.log(url)
    return url
}

function resetProgressBar() {
    ProgressBar.ariaValueNow = "0"
    ProgressBar.style = "width:0%;"
    ProgressBar.innerHTML = ""

}



UpdateDMarketData.onclick = () => {
    resetProgressBar()
    let fields = create_fields([
        ["gameId", "Game ID", 'string', true],
        ["limit", "Limit", 'number', true],
        ["offset", "Offset", 'number', true],
        ["orderBy", "Order By", 'select',true, [
            ['best_discount', "Best Discount [Best]"],
            ['price', "Price"],
            ['title', "Title [Don't use]"]
        ]],
        ["orderDir", "Order Direction", 'select',true, [
            ['desc', "Descendant [↓]"],
            ['asc', "Ascendant [↑]"]
        ]],
        ["currency", "Currency", 'select', true, [
            ['USD', "$ [USD]"],
            ['EUR', "€ [EUR] [W.I.P]"],
            ['ARS', "ARS$ [ARS] [W.I.P]"]
        ]],
        ["types", "Exchange Type",'select',true, [
            ['p2p', "F2F Only [Recommended]"], 
            ['dmsm, p2p', "DMarket Bot + F2F [May have trade lock]"], 
            ['dmsm', "DMarket Bot Only [Not Recommended]"]
        ]],
        ["priceFrom", "Price from", 'number',true],
        ["priceTo", "Price to", 'number',true],
        ["maxLimit", "Max Offer Limit", 'number', true]
    ])
    let popUp = new PopUp(fields, (fielding) => {
        for (let f=0; f<fielding.length; f++) {
            if (fielding[f].field_id === 'priceFrom') fielding[f].field_value = Math.round(fielding[f].field_value * 100)
            if (fielding[f].field_id === 'priceTo') fielding[f].field_value = Math.round(fielding[f].field_value * 100)
        }
        $.ajax({
            type: "POST",
            url: url_make("update-dmarket-data"),
            data: convert_fielding_to_object(fielding),
            dataType: "application/json",
            /* encode: true, */
            xhrFields: {
            withCredentials: true
            },
            statusCode: statusCode(
                (res, statusText) => {
                    let body = null
                    try {
                        body = res.responseText !== undefined ? JSON.parse(res.responseText) : res
                        
                        console.log("AAAAA: ", body)
                        console.log("A")
                        if (body.success === true) {
                            console.log("B")
                            popUp.clear()
                        }
                        console.log("C")
                        nAlert(http_code_to_color(res.status), Number(res.status) <= 200 ? "Success: " : "Error: ",  ((body.msg) ?  body.msg : "Unkown Error"), NOTIFICATION_TIMEOUT)
                    } catch (err) {
                        nAlert(http_code_to_color(res.status), Number(res.status) <= 200 ? "Success: " : "Error: ",  err, NOTIFICATION_TIMEOUT)
                    }
                    
                },
                serverError
            )
        });
    })

    
    $.ajax({
        type: "POST",
        url: _PROTOCOL+_HOST+"/utils/flash-config",
        data: {config: "update_internal_dmarket"},
        dataType: "json",
        xhrFields: {
        withCredentials: true
        },
        statusCode: statusCode(
            function success(res, statusText) {
                console.log("success:", res, statusText)
                res.flash_config.update_internal_dmarket.priceFrom = res.flash_config.update_internal_dmarket.priceFrom / 100
                res.flash_config.update_internal_dmarket.priceTo = res.flash_config.update_internal_dmarket.priceTo / 100
                popUp.show()
                if (res.flash_config.update_internal_dmarket !== undefined) popUp.populate(Object.entries(res.flash_config.update_internal_dmarket))
            },
            function error(code, res, statusText) {
                if (code === 404) {
                    popUp.show()
                    console.warn("user doesn't have flash config.")
                } else {
                    popUp.show()
                    console.warn(JSON.parse(res.responseText))
                    // serverError(code, res, statusText)
                }
            }
        )
    });
}

ItemNamit.onclick = () => {
    resetProgressBar()
    $.ajax(
        {
            type: "POST",
            url: url_make("item-naming"),
            encode: true,
            xhrFields: {
            withCredentials: true
            },
            statusCode: statusCode(
                function success(res, statusText) {
                    console.log("success:", res, statusText)
                    let body = res.responseText !== undefined ? JSON.parse(res.responseText) : res
                    setTimeout(() => {
                        $.ajax({
                            type: "GET",
                            url: url_make("websocket-addr"),
                            encode: true,
                            xhrFields: {
                            withCredentials: true
                            },
                            
                            statusCode: statusCode(function (response) {
                                console.log(response)
                                connect_progress(response, 0)
                            }, serverError)
                            
                        });
                    }, 100)
                    nAlert(COLOR_INFO, "Info: ", body.msg !== undefined ? body.msg : "Action started successfuly", NOTIFICATION_TIMEOUT)
                },
                serverError
            )

        }
    )
    

    
}

ItemPriceit.onclick = () => {
    let _fields = create_fields([
        ['steam_currency', "Steam currency", 'select', true, [
            ['USD', "$ [USD]"],
            ['EUR', "€ [EUR]"],
            ['ARS', "ARS$ [ARS]"]
        ]]
    ]);

    let popup_price = new PopUp(_fields, (fielding) => {
        
        $.ajax({
            type: "POST",
            url: url_make('item-pricing'),
            data: convert_fielding_to_object(fielding),
            dataType: "json",
            xhrFields: {
            withCredentials: true
            },
            statusCode: statusCode(
                function success(res, statusText) {
                    let mbody = null
                    try {
                        console.log("success:", res, statusText)
                        mbody = res.responseText !== undefined ? JSON.parse(res.responseText) : res
                        
                        setTimeout(() => {
                            $.ajax({
                                type: "GET",
                                url: url_make("websocket-addr"),
                                encode: true,
                                xhrFields: {
                                withCredentials: true
                                },

                                statusCode: statusCode(
                                    function (response) {
                                        console.log(response)
                                        let body = null
                                        try {
                                            body = response.responseText !== undefined ? JSON.parse(res.responseText) : response
                                            
                                            if (body.success === true) {
                                                
                                                
                                                connect_progress(response, 0)
                                                
                                                
                                            }
                                            
                                            
                                        } catch (err) {
                                            console.warn("Could not parse: ", response)
                                            nAlert(http_code_to_color(500), Number(code) <= 200 ? "Success: " : "Error: ",  err, NOTIFICATION_TIMEOUT)
                                        }
                                    },
                                    function(code, res, statusText) {
                                        serverError(code, res, statusText)
                                    })
                            })
                        }, 100)
                        nAlert(http_code_to_color(res.success === true ? 200: 400), res.success === true ? "Success: " : "Error: ",  ((mbody.msg) ?  mbody.msg : "Unkown Error"), NOTIFICATION_TIMEOUT)
                    } catch (err) {

                        console.warn("Could not parse: ", res, err)
                        nAlert(http_code_to_color(500), Number(500) <= 200 ? "Success: " : "Error: ",  err, NOTIFICATION_TIMEOUT)
                    }
                    
                    
                },
                function error(code, res, statusText) {
                    serverError(code, res, statusText)
                }
            )
            
        });
        
    })
    popup_price.show()
    
    
}

RetrieveBestDeals.onclick = () => {
    let _fields = create_fields([
        ['sort_type', "Sort Type",'select', true, [
            ['InstantPriceGap', "Instant Price Diff. [Less Profitable | Instant sell]"],
            ['MidPriceGap', "Mid-point Price Diff. [Profitable but unsure]"],
            ['AskPriceGap', "Ask Price Diff. [Most Profitable | 100% unlikely]"],
            ['InstantPriceGapRatio', "Instant Price Gap % [Same as IPD]"],
            ['MidPriceGapRatio', "Mid-point Price Gap % [Same as MPPD]"],
            ['AskGapPriceRatio', "Ask Gap % [Same as APD]"]
        ]], 
        ['sort_direction', "Sort Direction",'select', true, [
            ['1', "Descendant"],
            ['0', "Ascendant"]
        ]],
        ['offset',"Offset",'number', false],
        ['offer_count', "Max Offer Retrieved",'number', true]
    ])
    let rbd_popup = new PopUp(_fields, (fielding) => {
        $.ajax({
            type: "POST",
            url: url_make("bestdeals"),
            data: convert_fielding_to_object(fielding),
            dataType: "application/json",
            /* encode: true, */
            xhrFields: {
                withCredentials: true
            },
            statusCode: statusCode(
                (res, statusText) => {
                    let body = null
                    try {
                        body = res.responseText !== undefined ? JSON.parse(res.responseText) : res
                        
                        console.table(body)
                        //nAlert(http_code_to_color(res.status), Number(res.status) <= 200 ? "Success: " : "Error: ",  ((body.msg) ?  body.msg : "Unkown Error"), NOTIFICATION_TIMEOUT)
                        if (body.success === true) {
                            show_table_deals()
                            fill_table_offerbook(body.msg.offerbook)
                            OFFERBOOK = body.msg.offerbook
                            rbd_popup.clear()
                        }
                    } catch (err) {
                        rbd_popup.clear()
                        nAlert(http_code_to_color(500), Number(500) <= 200 ? "Success: " : "Error: ",  err, NOTIFICATION_TIMEOUT)
                        throw err;
                        
                    }
                    
                },
                serverError
            )
        });
    })
    $.ajax({
        type: "POST",
        url: _PROTOCOL+_HOST+"/utils/flash-config",
        data: {config: "retrieve_best_deals_dmarket"},
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },
        statusCode: statusCode(
            function success(res, statusText) {
                console.log("success:", res, statusText)
                rbd_popup.show()
                if (res.flash_config.retrieve_best_deals_dmarket !== undefined) rbd_popup.populate(Object.entries(res.flash_config.retrieve_best_deals_dmarket));
            },
            function error(code, res, statusText) {
                if (code === 404) {
                    rbd_popup.show()
                    console.warn("user doesn't have flash config.")
                } else {
                    rbd_popup.show()
                    console.warn(JSON.parse(res.responseText))
                    // serverError(code, res, statusText)
                }
            }
        )
    });
}

$.ajax({
    type: "GET",
    url: url_make("cache-offerbook"),
    success: function (response) {
        if (Object.keys(response) === 0) {
         console.log("Null res: " + response)
         return   
        }
        show_table_deals()
        fill_table_offerbook(response)
    }
});