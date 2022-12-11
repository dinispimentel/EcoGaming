export const COLOR_ERROR = "rgb(255, 87, 51)"
export const COLOR_INFO = "royalblue"
export const COLOR_SUCCESS = "chartreuse"

export function alert(color, header, msg, timeout) {
    let new_alert = document.createElement('div')
    let multi_alert_holder = document.getElementById('alert-multi-item-wrapper')
    if (multi_alert_holder === null || multi_alert_holder === undefined) {
        multi_alert_holder = document.createElement('div')
        multi_alert_holder.id = "alert-multi-item-wrapper"
        multi_alert_holder.classList.add('unselectable')
        document.body.insertBefore(multi_alert_holder, document.body.firstChild)
    } else {
        multi_alert_holder.classList.remove("multi-alert-hide")
    }

    multi_alert_holder.classList.remove('multi-alert-hide')
    let alert_wrapper = document.createElement('div')
    alert_wrapper.classList.add('alert-item-wrapper')

    

    let alert_content = document.createElement('div')
    alert_content.classList.add('alert-item-content')

    let alert_fade = document.createElement('div') 
    alert_fade.style = "transition: width "+ String(timeout/1000) +"s!important; background-color: " + color + "!important;"
    alert_fade.classList.add('alert-item-fade-progress')
    
    let alert_header_text = document.createElement('span')
    alert_header_text.classList.add('alert-header-text')
    alert_header_text.innerText = header

    let alert_details_text = document.createElement('span')
    alert_details_text.classList.add('alert-details-text')
    alert_details_text.innerText = String(msg)

    alert_content.appendChild(alert_header_text)
    alert_content.appendChild(alert_details_text)

    alert_wrapper.appendChild(alert_content)
    alert_wrapper.appendChild(alert_fade)

    multi_alert_holder.appendChild(alert_wrapper)

    
    setTimeout ( () => {
        alert_fade.classList.add('alert-item-fade')
    }, 100)
    setTimeout( () => {
        
        /* multi_alert_holder.setAttribute('hidden', "true") */
        if (multi_alert_holder.children.length < 2) {
            multi_alert_holder.classList.add('multi-alert-hide')
        }
        alert_wrapper.remove()
        
    }, timeout+100)
    
}

export function show_past() {

}

