
import { PopUp, create_fields } from '/js/utils/form_popup.js'
import { statusCode } from '/js/utils/error_handling.js'
import { alert as nAlert, COLOR_ERROR, COLOR_INFO, COLOR_SUCCESS } from '/js/utils/notification.js'
import { connect_progress, ProgressHandler, clearRows, createHeader, http_code_to_color, show_table_deals,
    convert_fielding_to_object, serverError } from '/js/utils/deals.js'

const TableDeals = document.getElementById('table-deals')
const ScanNewGames = document.getElementById('remote-brand-scan')
const FindGameBrand = document.getElementById('remote-branding')
const G2GPricing = document.getElementById('remote-pricing')
const SteamAppID = document.getElementById('remote-steam-appid')
const SteamPrice = document.getElementById('remote-steam-price')
const RetrieveBestDeals = document.getElementById('remote-retrieve-deals')

const _PROTOCOL = String(window.location).split("//")[0] + "//"
const PREFIX = "/g2gsdb/"
const _HOST = (String(window.location).substring(0,5) === "http:" ? String(window.location).split("/")[2] : "ecogaming.ga")

function url_make(path) {
    let url = _PROTOCOL+_HOST+PREFIX+ path
    console.log(url)
    return url
}

ScanNewGames.onclick = () => {

    function success(response, statusText) {

    }

    function err(res, statusText) {

    }

    $.ajax({
        type: "POST",
        url: url_make(""),
        data: "data",
        dataType: "dataType",
        statusCode: statusCode(success, err)
    });


}
