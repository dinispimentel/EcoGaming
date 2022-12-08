import {PopUp, create_fields} from '/js/utils/form_popup.js'

const UpdateDMarketData = document.getElementById('remote-update-dmarket')
const ItemNamit = document.getElementById('remote-item-nameit')

const ProgressBar = document.getElementById('progress-bar-remote')

const _PROTOCOL = String(window.location).split("//")[0] + "//"
const PREFIX = "/dmsm/"
const _HOST = (String(window.location).substring(0,5) === "http:" ? String(window.location).split("/")[2] : "ecogaming.ga")
console.log ("HOST", _HOST)
function url_make(path) {
    let url = _PROTOCOL+_HOST+"/dmsm/" + path
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
        ["orderBy", "Order By", 'string',true],
        ["orderDir", "Order Direction", 'string',true],
        ["currency", "Currency", 'string',true],
        ["types", "Exchange Type",'select',true, [
            ['p2p', "F2F Only [Recommended]"], 
            ['dmsm, p2p', "DMarket Bot + F2F (may have trade lock)"], 
            ['dmsm', "DMarket Bot Only [Not Recommended]"]
        ]],
        ["priceFrom", "Price from", 'number',true],
        ["priceTo", "Price to", 'number',true],
        ["maxLimit", "Max Offer Limit", 'number', true]
    ])
    let popUp = new PopUp(fields, (field_name_value) => {
        $.ajax({
            type: "GET",
            url: url_make("update_internal_dmarket"),
            data: field_name_value,
            dataType: "application/json",
            encode: true,
            xhrFields: {
            withCredentials: true
            },
            success: function (response) {
                
            }
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
        success: function (response) {
            popUp.show()
            console.log(response)
            popUp.populate(Object.entries(response.flash_config.update_internal_dmarket))        
        }
    });
}

ItemNamit.onclick = () => {
    resetProgressBar()
    $.ajax(
        {
            type: "POST",
            url: url_make("item-naming"),
    /*         data: "data",
            dataType: "dataType", */
           /*  xhrFields: {
                withCredentials: true
             }, */
             encode: true,
            xhrFields: {
            withCredentials: true
            },
            success: function (response) {
                console.log(response)
                setTimeout(() => {
                    $.ajax({
                        type: "GET",
                        url: url_make("websocket-addr"),
                /*         data: "data",
                        dataType: "dataType", */
                        /* xhrFields: {
                            withCredentials: true
                         }, */
                         encode: true,
                        xhrFields: {
                        withCredentials: true
                        },
                        success: function (response) {
                            console.log(response)
                            const wsprogress = new WebSocket(`ws://${response.host}:${response.port}/progress`)
                            wsprogress.onmessage = (ev) => {
                                let data = JSON.parse(ev.data)
                                ProgressBar.style = "width:" + String(Number(data.data.progress)*100) + "%;"
                                ProgressBar.ariaValueNow = String(Number(data.data.progress)*100)
                                ProgressBar.innerHTML = String(Number(data.data.progress)*100) + "%"
                                
                            }
                        }
                    });
                }, 10)
                
            }
        }
    )
    

    
}