
const ID_PREFIX = "form-popup-field-"

export const create_fields = (arr_arr) => {
    let fields = []
    for (let iarr=0; iarr<arr_arr.length;iarr++) {
        let topush = {
            field_id: arr_arr[iarr][0],
            field_name: arr_arr[iarr][1],
            field_type: arr_arr[iarr][2],
            mandatory: arr_arr[iarr][3]
        }
        if (arr_arr[iarr].length > 4) {
            topush.field_options = arr_arr[iarr][4]
        }
        fields.push(topush)
    }
    return fields
}

function _createField (field_id, field_name, field_type, mandatory, field_options) {
    let field_div = document.createElement('div')
    field_div.classList.add('form-popup-field-div')

    let field_header = document.createElement('h3')
    field_header.innerText = field_name
    field_header.classList.add('form-popup-field-header')
    field_header.classList.add('form-popup-field-entry')
    if (mandatory === true) {
        let field_star = document.createElement('span')
        field_header.appendChild(field_star)
        field_star.classList.add('form-popup-field-mandatory')
        field_star.innerText = "*"
    }
    

    field_div.appendChild(field_header)

    let field_input = null
    if (field_type !== 'select') {
        field_input = document.createElement('input')
        field_input.type = "text"
        field_input.classList.add('form-popup-field-entry')
        field_input.classList.add('form-popup-field-div-input')
        
        
    } else {
        field_input = document.createElement('select')
        
        field_input.classList.add('form-popup-field-entry')
        field_input.classList.add('form-popup-field-div-input')
        for (let fo=0; fo < field_options.length; fo++) {
            let op = document.createElement('option')
            op.value = field_options[fo][0]
            op.text = field_options[fo][1]
            field_input.appendChild(op)
        }
        
    }
    field_input.id = ID_PREFIX + field_id
    
    field_div.appendChild(field_input)

    return field_div
}




export class PopUp {
    constructor (requested_data_arr, on_submit_cb) {

        // [ { field_id: string, field_name: string, field_type: string, mandatory: boolean, field_options: array<[code, formattedText]>}]
        this.fields = requested_data_arr
        this.pop_up_div = null
        this.pop_up_display = null
        this.pop_up_submit = null
        this.pop_up_close = null
        this.on_submit_cb = on_submit_cb
    }

    

    show() {
        this.pop_up_div = document.createElement('div')
        this.pop_up_div.classList.add('form-popup-div')
        let pop_up_horizontal_div = document.createElement('div')
        pop_up_horizontal_div.classList.add('form-popup-field-center-div')
        
        this.pop_up_display = document.createElement('div')
        this.pop_up_display.classList.add('form-popup-display')

        for (let i=0; i < this.fields.length; i++) {
            let field_config = this.fields[i]
            let field_div = _createField(field_config.field_id, field_config.field_name, field_config.field_type, field_config.mandatory, field_config.field_options)
            if (i===0) field_div.classList.add('form-popup-field-first-div')
            this.pop_up_display.appendChild(field_div)
        }

        this.pop_up_submit = document.createElement('button')
        this.pop_up_submit.onclick = () => {
            let bf = this._checkTyping()
            if (bf.length > 0) {
                let error_fields = "The following fields have errors:"
                for (let f=0; f< bf.length; f++) {
                    error_fields = error_fields + "\n" + bf[f][0] + ": " + bf[f][1]
                }
                alert(error_fields)
                return 
            }
            let ret = []
            
            for (let f=0; f<this.fields.length; f++) {
                ret.push({field_id: this.fields[f].field_id, field_value: this.getFieldById(this.fields[f].field_id).value,
                    field_type: this.fields[f].field_type})
            }
            this.on_submit_cb(ret)
            // this.clear() handled by the caller
        }
    
        this.pop_up_submit.classList.add('form-popup-button')
        this.pop_up_submit.classList.add('btn')
        this.pop_up_submit.classList.add('btn-primary')
        this.pop_up_submit.innerText = "Submit"
        this.pop_up_close = document.createElement('button')
        this.pop_up_close.onclick = () => {
            this.clear()
        }
        this.pop_up_close.classList.add('form-popup-button')
        this.pop_up_close.classList.add('btn')
        this.pop_up_close.classList.add('btn-outline-primary')
        this.pop_up_close.innerText = "Close"
        let button_entry_div = document.createElement('div')
        button_entry_div.classList.add('form-popup-field-buttons')
        button_entry_div.appendChild(this.pop_up_submit)
        button_entry_div.appendChild(this.pop_up_close)
        this.pop_up_display.appendChild(button_entry_div)
        pop_up_horizontal_div.appendChild(this.pop_up_display)
        this.pop_up_div.appendChild(pop_up_horizontal_div)
        
        
        document.body.insertBefore(this.pop_up_div, document.body.firstChild)
        
    }
    
    clear() {
        this.fields = null
        this.pop_up_div.remove()
        this.pop_up_display = null
        this.pop_up_submit = null
        this.on_submit_cb = null
        this.pop_up_div = null
        this.on_show = null
        this.pop_up_close = null
        
    }

    getFieldById(id) {
        let inputs = document.getElementsByClassName('form-popup-field-div-input')
        return inputs[ID_PREFIX + id]
    }

    _checkTyping() {
        let bad_fields = []    
        for (let i=0; i < this.fields.length; i++) {
            let field = this.getFieldById(this.fields[i].field_id).value
            if (this.fields[i].mandatory && (field === null || field === "")) {
                console.warn(field.innerHTML)
                bad_fields.push([this.fields[i].field_name, "Mandatory"])
            } else if (this.fields[i].field_type === typeof 1 && isNaN(Number(field))) {
                bad_fields.push([this.fields[i].field_name, "Not a Number"])
            } 
        }
        return bad_fields
    }

    populate(fi_fv) {
        // array< { field_id, field_value } >
        for (let f=0; f<fi_fv.length;f++) {
            this.getFieldById(fi_fv[f][0]).value = fi_fv[f][1]
        }
    }
}