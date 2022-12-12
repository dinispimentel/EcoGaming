
import { PopUp, create_fields } from '/js/utils/form_popup.js'
import { statusCode } from '/js/utils/error_handling.js'
import { alert as nAlert, COLOR_ERROR, COLOR_INFO, COLOR_SUCCESS } from '/js/utils/notification.js'
import { connect_progress, ProgressHandler, clearRows, createHeader, http_code_to_color, show_table_deals,
    convert_fielding_to_object, serverError, http_code_to_header } from '/js/utils/deals.js'

const TableDeals = document.getElementById('table-deals')
const ScanNewGames = document.getElementById('remote-brand-scan')
const FindGameBrand = document.getElementById('remote-branding')
const G2GPricing = document.getElementById('remote-pricing')
const SteamAppID = document.getElementById('remote-steam-appid')
const SteamPrice = document.getElementById('remote-steam-price')
const RetrieveBestDeals = document.getElementById('remote-retrieve-deals')
const NOTIFICATION_TIMEOUT = 6000
const _PROTOCOL = String(window.location).split("//")[0] + "//"
const PREFIX = "/g2gsdb/"
const _HOST = (String(window.location).substring(0,5) === "http:" ? String(window.location).split("/")[2] : "ecogaming.ga")

/*
    ADICIONAR ONCLICK DOS BTNS DE BLACK LIST NO LOAD DO SCRIPT/DOM
*/
function black_list_on_click(bl_link) {
    
    
    let b = confirm(`Queres mesmo colocar ${String(bl_link.id).slice(10, String(bl_link.id).length)} na blacklist?\nEsta ação é permanente*`)
    if (b) {
        $.ajax({
            type: "POST",
            url: url_make("blacklist-add"),
            data: {
                black_list_titles: String(bl_link.id).slice(10, String(bl_link.id).length)
            },
            dataType: "dataType",
            statusCode: statusCode((res, stats) => {default_success(res, stats); bl_link.parentElement.parentElement.remove()}, serverError)
        });
    }
}
if (document.getElementsByTagName('td').length > 1) {
    let bl_links = document.getElementsByClassName('black-list-link')
    for (const bl_link of bl_links) {
        bl_link.onclick = () => {black_list_on_click(bl_link)}
    }
}

function url_make(path) {
    let url = _PROTOCOL+_HOST+PREFIX+ path
    console.log(url)
    return url
}

function default_success(response, statusText) {
    let body = response.responseText !== undefined ? JSON.parse(response.responseText) : response
    nAlert(http_code_to_color(200), http_code_to_header(200), body.msg, NOTIFICATION_TIMEOUT)
}

ScanNewGames.onclick = () => {
    $.ajax({
        type: "POST",
        url: url_make("scan-games"),
        statusCode: statusCode(default_success, serverError)
    });
}

FindGameBrand.onclick = () => {
    let _fields = create_fields([
        ["min_offers", "Minium Offers", 'number', true]
    ])
    let fgb_popup = new PopUp(_fields, (fielding) => {
        let data = convert_fielding_to_object(fielding)
        $.ajax({
            type: "POST",
            url: url_make("brand-games"),
            data: data, 
            dataType: "application/json",
            statusCode: statusCode((res, stats) => {default_success(res, stats); fgb_popup.clear()}, serverError)
        });
    })
    fgb_popup.show()
    
}

G2GPricing.onclick = () => {
    let _fields = create_fields([
        ['currency', "Currency", 'select', true, [
            ["USD", "$ USD"],
            ["EUR", "€ EUR"]
        ]]
    ])
    let g2g_pricing_popup = new PopUp(_fields, (fielding) => {
        let data = convert_fielding_to_object(fielding)
        $.ajax({
            type: "POST",
            url: url_make("price-games"),
            data: data, 
            dataType: "application/json",
            statusCode: statusCode((res, stats) => {default_success(res, stats); g2g_pricing_popup.clear()}, serverError)
        });
    })
    g2g_pricing_popup.show()
    
}

SteamAppID.onclick = () => {
    $.ajax({
        type: "POST",
        url: url_make("steam-appid-games"),
        statusCode: statusCode(default_success, serverError)
    });
}

SteamPrice.onclick = () => {
    let _fields = create_fields([
        ['base_currency', "Currency", 'select', true, [
            ["USD", "$ USD"],
            ["EUR", "€ EUR"],
            ["ARS", "ARS$"]
        ]]
    ])
    let steam_pricing_popup = new PopUp(_fields, (fielding) => {
        let data = convert_fielding_to_object(fielding)
        $.ajax({
            type: "POST",
            url: url_make("steam-price-games"),
            data: data, 
            dataType: "application/json",
            statusCode: statusCode((res, stats) => {default_success(res, stats); steam_pricing_popup.clear()}, serverError)
        });
    })
    
    steam_pricing_popup.show()

}

RetrieveBestDeals.onclick = () => {
    let _fields = create_fields([
        ["sort_type", "Sorting Type", 'select', true, [
            ['priceGapOrder', "Price Gap [Diff]"], 
            ['priceGapPercentage', "Price Gap %"],
            ['abcOrder', "Alphabetic Order"], 
            ['brandOrder', "Brand Order"], 
            ['offerOrder', "Offer Order"]
        ]],
        ["sort_direction", "Sort Direction", 'select', true, [
            ['1', "Descendant"],
            ['0', "Ascendant"]
        ]],
        ["offer_count", "Max Games Shown", 'number', true],
        ["offset", "Offset", 'number', false]
    ])
    let rbd_best_deals = new PopUp(_fields, (fielding) => {
        let data = convert_fielding_to_object(fielding)
        $.ajax({
            type: "POST",
            url: url_make("best-deals"),
            data: data,
            dataType: "application/json",
            statusCode: statusCode((res, stats) => {default_success(res, stats); console.table(res); populate_table_deals(JSON.parse(res.responseText).msg.offerbook); show_table_deals(); rbd_best_deals.clear()}, serverError)
        });
    })
    $.ajax({
        type: "POST",
        url: _PROTOCOL+_HOST+"/utils/flash-config",
        data: {config: "retrieve_best_deals_g2gsdb"},
        dataType: "json",
        xhrFields: {
            withCredentials: true
        },
        statusCode: statusCode(
            function success(res, statusText) {
                console.log("success:", res, statusText)
                rbd_best_deals.show()
                if (res.flash_config.retrieve_best_deals_g2gsdb !== undefined) rbd_best_deals.populate(Object.entries(res.flash_config.retrieve_best_deals_g2gsdb));
            },
            function error(code, res, statusText) {
                if (code === 404) {
                    rbd_best_deals.show()
                    console.warn("user doesn't have flash config.")
                } else {
                    rbd_best_deals.show()
                    console.warn(JSON.parse(res.responseText))
                    // serverError(code, res, statusText)
                }
            }
        )
    });
    
}


function populate_table_deals (offerbook) {
    clearRows()
    for (let o=1; o<Object.keys(offerbook.offers).length; o++) {
        let table_row = TableDeals.insertRow(-1)
        let game_title = Object.keys(offerbook.offers)[o]
        let offer = offerbook.offers[game_title]
        let g2g_price = Number(offer.g2gprice.cValue || offer.g2gprice.value)
        let steam_prices = offer.steamprices
        let steam_prices_display = ""
        let steam_prices_diffs_ratio = ""
        let steam_prices_diffs = ""
        let currency = String((offer.g2gprice.cCurrency || offer.g2gprice.currency))

        currency = currency === "USD" ? "$" : (currency === "EUR" ? "€" : currency)
        let _title_header = createHeader(table_row, "", ["table-entry", "first-entry", "left-align-entry", "title-entry"])
        for (const steam_price of steam_prices) {
            steam_prices_display = steam_prices_display + String(steam_price.cValue.toFixed(2)) + currency + "(" +String(steam_price.currency) + ") | "
            steam_prices_diffs = steam_prices_diffs + String((g2g_price - steam_price.cValue).toFixed(2)) + currency + " | "
            steam_prices_diffs_ratio = steam_prices_diffs_ratio + String((((g2g_price - steam_price.cValue)/steam_price.cValue)*100).toFixed(2) ) + "% | "
        }
        steam_prices_display = steam_prices_display.slice(0, steam_prices_display.length-3)
        steam_prices_diffs = steam_prices_diffs.slice(0, steam_prices_diffs.length-3)
        steam_prices_diffs_ratio = steam_prices_diffs_ratio.slice(0, steam_prices_diffs_ratio.length-3)

        createHeader(table_row, String(g2g_price.toFixed(2)) + currency, ["table-entry", "g2g-price-entry"] ) 

        createHeader(table_row, steam_prices_display, ["table-entry", "steam-price-entry"])

        createHeader(table_row, steam_prices_diffs, ["table-entry", "gain-diff-entry"])

        createHeader(table_row, steam_prices_diffs_ratio, ["table-entry", "gain-percentage-entry"])
        
        createHeader(table_row, String(offer.count), ["table-entry", "offer-count-entry"])

        
        let _title_icon_div = document.createElement('div')
        _title_icon_div.classList.add('force-single-row')

        let _steam_icon = document.createElement('i')
        _steam_icon.classList.add('fa-solid', 'fa-circle-up', "icon-link")
        let _steam_link = document.createElement('a')
        _steam_link.setAttribute('href', "https://store.steampowered.com/app/" + offer.appID)
        _steam_link.appendChild(_steam_icon)
        _steam_link.classList.add('anchor-entry')
        _steam_link.setAttribute('target', '_blank')
        

        let _g2g_icon = document.createElement('i')
        _g2g_icon.classList.add('fa-solid', 'fa-circle-down', "icon-link")
        let _g2g_link = document.createElement('a')
        _g2g_link.setAttribute('href', "https://www.g2g.com/categories/" + offer.path)
        _g2g_link.appendChild(_g2g_icon)
        _g2g_link.classList.add('anchor-entry')
        _g2g_link.setAttribute('target', '_blank')
        
        _title_icon_div.innerText = game_title + " "
        _title_icon_div.appendChild(_steam_link)
        _title_icon_div.appendChild(_g2g_link)
        _title_header.appendChild(_title_icon_div)
        
        let _black_list_header = table_row.insertCell(-1)
        _black_list_header.classList.add("table-entry", "black-list-entry", "center-align-entry")
        let _black_list_link = document.createElement('a')
        _black_list_link.classList.add('anchor-entry', 'black-list-link')
        _black_list_link.id = "blacklist-" + game_title
        _black_list_link.onclick = () => {black_list_on_click(_black_list_link)}
        let _black_list_icon = document.createElement('i')
        _black_list_icon.classList.add("fa-solid", "fa-circle-minus", "icon-link")
        
        _black_list_link.appendChild(_black_list_icon)
        _black_list_header.appendChild(_black_list_link)

        let _transpose_header = table_row.insertCell(-1)
        let _transpose_checkbox = document.createElement('input')
        _transpose_checkbox.setAttribute('type', 'checkbox')
        _transpose_checkbox.id = `transpose-${game_title}`
        _transpose_header.appendChild(_transpose_checkbox)
        _transpose_header.classList.add('last-entry', 'table-entry', 'transpose-entry')
        //document.getElementsByTagName('tbody').appendChild(table_row)
        
    }
    
    
}