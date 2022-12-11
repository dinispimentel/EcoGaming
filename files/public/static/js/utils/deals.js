const MAX_WS_RETRIES = 5
const CONNECT_RETRY_WAIT = 1000 // ms
const DEBUG_ADDRESS = "192.168.0.120"
import { COLOR_ERROR, COLOR_SUCCESS } from '/js/utils/notification.js'
export function connect_progress(response, times) {
    try {
        const wsprogress = new WebSocket(`ws://${DEBUG_ADDRESS || response.host}:${response.port}/progress`)
        wsprogress.onmessage = (ev) => {ProgressHandler(ev, wsprogress)}                          
    } catch (err) {
        if (times < MAX_WS_RETRIES) {
            setTimeout( () => {
                connect_progress(response, times+1)
            }, CONNECT_RETRY_WAIT*times)
        } else {
            throw err;
        }
    }
}

export function ProgressHandler (ev, wsprogress) {
    let data = JSON.parse(ev.data)
    if (data.data.end === "end") {
        wsprogress.close(1000, "All done")
        resetProgressBar()
        return
    }
    ProgressBar.style = "width:" + String((Number(data.data.progress)*100).toFixed(2)) + "%;"
    ProgressBar.ariaValueNow = String((Number(data.data.progress)*100).toFixed(2))
    ProgressBar.innerHTML = String((Number(data.data.progress)*100).toFixed(2)) + "%"
    
}

export function clearRows() {  // return boolean done
    // let trs = document.getElementsByTagName('tr')
    let trs = document.querySelectorAll("tr:not(.first-row)");
    /* for (let r=0; r<trs.length; r++) {
        if(!trs[r].classList.contains('first-row')) {
            trs[r].remove()
        }
    } */
    for (const tr of trs) {
        tr.remove()
    }
}

export function createHeader(table_row, data, header_classes) {
    let td = table_row.insertCell(-1)
    td.innerText = String(data)
    if (header_classes) {
        if (typeof header_classes !== typeof []) {
            header_classes = [header_classes]
        }
        td.classList.add(...header_classes)
    }

    return td

}
export function http_code_to_color (code) {
    code = Number(code)
    if (code >= 500) {
        return "darkred"
    } else if ( code <= 200 ) {
        return COLOR_SUCCESS
    } else {
        return COLOR_ERROR
    }
}

export function show_table_deals() {
    document.getElementById('table-deals').removeAttribute('hidden')
    let no_data = document.getElementById('no-data')
    if (! (no_data === undefined || no_data === null)) {
        no_data.remove()
    }
}

export function serverError(code, res, statusText) {
    console.log("error:", res, statusText)
    try {
        let jres = JSON.parse(res.responseText)
        nAlert(http_code_to_color(code), Number(code) <= 200 ? "Success: " : "Error: ",  ((jres.msg) ?  jres.msg : "Unkown Error"), NOTIFICATION_TIMEOUT)
        console.table(jres)
    } catch {
        nAlert(http_code_to_color(code), Number(code) <= 200 ? "Success: " : "Error: ",  res, NOTIFICATION_TIMEOUT)
    }
    
}

export function convert_fielding_to_object(arr_arr) {
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