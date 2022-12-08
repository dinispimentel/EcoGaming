import { PopUp, create_fields } from '/js/utils/form_popup.js'
import { statusCode } from '/js/utils/error_handling.js'
const UpdateDMarketData = document.getElementById('remote-update-dmarket')
const ItemNamit = document.getElementById('remote-item-nameit')
const ItemPriceit = document.getElementById('remote-item-priceit')
const RetrieveBestDeals = document.getElementById('remote-retrieve-deals')
const ProgressBar = document.getElementById('progress-bar-remote')

const _PROTOCOL = String(window.location).split("//")[0] + "//"
const PREFIX = "/dmsm/"
const _HOST = (String(window.location).substring(0,5) === "http:" ? String(window.location).split("/")[2] : "ecogaming.ga")
console.log ("HOST", _HOST)
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

function serverError(code, res, statusText) {
    console.log("error:", res, statusText)
    try {
        let jres = JSON.parse(res.responseText)
        alert(String(code) + " | " + ((jres.msg) ?  jres.msg : "Unkown Error"))
        console.table(jres)
    } catch {
        alert(String(code) + " | " + String(res))
    }
    
}

function convert_fielding_to_object(arr_arr) {
    let obj = {}
    for (let ia=0; ia<arr_arr.length; ia++) {
        switch (arr_arr[ia].field_type) {
            case 'number':
                obj[String(arr_arr[ia].field_id)] = Number(arr_arr[ia].field_value)
                break
            default:
                obj[String(arr_arr[ia].field_id)] = String(arr_arr[ia].field_value)
                break
            
        }
    }
    return obj
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
                        alert(body.msg)
                    } catch {
                        alert("Unparsable msg from server")
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
                popUp.populate(Object.entries(res.flash_config.update_internal_dmarket))
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
                                const wsprogress = new WebSocket(`ws://${response.host}:${response.port}/progress`)
                                wsprogress.onmessage = (ev) => {
                                    let data = JSON.parse(ev.data)
                                    ProgressBar.style = "width:" + String(Number(data.data.progress)*100) + "%;"
                                    ProgressBar.ariaValueNow = String(Number(data.data.progress)*100)
                                    ProgressBar.innerHTML = String(Number(data.data.progress)*100) + "%"
                                    if (data.data.progress === 1) {
                                        wsprogress.close(1000, "All done")
                                        resetProgressBar()
                                    }
                                }
                            }, serverError)
                            
                        });
                    }, 100)
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
                                                const wsprogress = new WebSocket(`ws://${response.host}:${response.port}/progress`)
                                                wsprogress.onmessage = (ev) => {
                                                    let data = JSON.parse(ev.data)
                                                    ProgressBar.style = "width:" + String(Number(data.data.progress)*100) + "%;"
                                                    ProgressBar.ariaValueNow = String(Number(data.data.progress)*100)
                                                    ProgressBar.innerHTML = String(Number(data.data.progress)*100) + "%"
                                                    if (data.data.progress === 1) {
                                                        wsprogress.close(1000, "All done")
                                                        resetProgressBar()
                                                    }
                                                }                                   
                                            }
                                            
                                            
                                        } catch {
                                            console.warn("Could not parse: ", response)
                                            alert("Unparsable msg from server")
                                        }
                                    },
                                    function(code, res, statusText) {
                                        serverError(code, res, statusText)
                                    })
                            })
                        }, 100)
                        alert(mbody.msg)
                    } catch (err) {

                        console.warn("Could not parse: ", res, err)
                        alert("Unparsable msg from server")
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
            ['MidPriceGapRatio', "Mid-point Price Gap % [Same as MPPD]"]
            ['AskGapPriceRatio', "Ask Gap % [Same as APD]"]
        ]], 
        ['sort_direction', "Sort Direction",'select', true, [
            ['1', "Descendant"],
            ['0', "Ascendant"]
        ]],
        ['offset', "Offset",'number', true],
        ['offer_count', "Max Offer Retrieved",'number', true]
    ])
    let rbd_popup = new PopUp(_fields, (fielding) => {
        $.ajax({
            type: "GET",
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
                        alert(body.msg)
                    } catch {
                        alert("Unparsable msg from server")
                    }
                    
                },
                serverError
            )
        });
    })
    rbd_popup.show()
}