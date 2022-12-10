import { PopUp, create_fields } from '/js/utils/form_popup.js'
import { statusCode } from '/js/utils/error_handling.js'
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

function clearRows() {
    let trs = document.getElementsByTagName('tr')
    for (let r=0; r<trs.length; r++) {
        if(!trs[r].classList.contains('first-row')) {
            trs[r].remove()
        }
    }
}

function createHeader(table_row, data) {
    let th = table_row.insertCell(-1)
    th.innerText = String(data)
    return th

}

function buy_item(id) {
    alert("Trying to buy: " + String(id))
    // TODO:// ASK TO CONFIRM 
    let allow_to_buy = confirm("Do you really wish to buy ... ?")
    
    // TODO:// SEND SERVER REQUEST TO BUY ITEM (PREMIUM ONLY)
    console.log("Allow to buy: ", allow_to_buy)
}

function show_table_deals() {
    document.getElementById('table-deals').removeAttribute('hidden')
    let no_data = document.getElementById('no-data')
    if (! (no_data === undefined || no_data === null)) {
        no_data.remove()
    }
}

function fill_table_offerbook(offerbook) {
    clearRows()
    for (let o=0; o<offerbook.offers.length; o++) {
        let table_row = TableDeals.insertRow(-1)
       
        let headers = [
            createHeader(table_row,offerbook.offers[o].title),
            createHeader(table_row, String(offerbook.offers[o].dm_price.cValue || offerbook.offers[o].dm_price.value) + 
            String((offerbook.offers[o].dm_price.cCurrency || offerbook.offers[o].dm_price.currency) ) ) ,
            createHeader(table_row, String(offerbook.offers[o].sm_price.cValue || offerbook.offers[o].sm_price.value) + 
            String((offerbook.offers[o].dm_price.cCurrency || offerbook.offers[o].dm_price.currency) )),
            createHeader(table_row, 
                String(
                    Number((offerbook.offers[o].sm_price.cValue || offerbook.offers[o].sm_price.value) -
                (offerbook.offers[o].dm_price.cValue || offerbook.offers[o].dm_price.value)).toFixed(2)
                ) + 
                String((offerbook.offers[o].dm_price.cCurrency || offerbook.offers[o].dm_price.currency) )
            ),
            createHeader( table_row,
                String((
                    (((offerbook.offers[o].sm_price.cValue || offerbook.offers[o].sm_price.value) -
                (offerbook.offers[o].dm_price.cValue || offerbook.offers[o].dm_price.value))
                /(offerbook.offers[o].dm_price.cValue || offerbook.offers[o].dm_price.value))*100
            ).toFixed(2)) + "%"
            )

        ]
        for (let h=0; h<headers.length; h++) {
            if (h===0) {
                headers[h].classList.add('first-entry')
                headers[h].classList.add('left-align-entry')
            }
            
            headers[h].classList.add('table-entry')
        }

        let _buy_header = table_row.insertCell(-1) // diferenciado
        let _buy_link = document.createElement('a')
        // _buy_link.setAttribute('onclick', `buy_item("${offerbook.offers[o].itemId}")`)
        _buy_link.onclick = () => {buy_item(offerbook.offers[o].itemId)}
        _buy_link.classList.add('buy-entry-link')
        _buy_link.innerText = "Buy"
        _buy_header.appendChild(_buy_link)
        _buy_header.classList.add('buy-entry')
        _buy_header.classList.add('table-entry')
        let _transpose_header = table_row.insertCell(-1)
        let _transpose_checkbox = document.createElement('input')
        _transpose_checkbox.setAttribute('type', 'checkbox')
        _transpose_checkbox.id = `transpose-${offerbook.offers[o].itemId}`
        _transpose_header.appendChild(_transpose_checkbox)
        _transpose_header.classList.add('last-entry')
        _transpose_header.classList.add('table-entry')
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
                        
                        console.log("AAAAA: ", body)
                        console.log("A")
                        if (body.success === true) {
                            console.log("B")
                            popUp.clear()
                        }
                        console.log("C")
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
                        alert(body)
                        if (body.success === true) {
                            show_table_deals()
                            fill_table_offerbook(body.msg.offerbook)
                            rbd_popup.clear()
                        }
                    } catch (err) {
                        rbd_popup.clear()
                        throw err;
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

