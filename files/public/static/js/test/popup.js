import {PopUp, create_fields} from '/js/utils/form_popup.js'
const btn = document.getElementById('show_popup')



btn.onclick = () => {
    let pop = new PopUp(create_fields([
        ["Strings", 'string', true],
        ["Numbers", 'number', false],
        ["Types", 'select', true, [['dmsm, p2p', "DMarket Bot e F2F"], ['p2p', "F2F only"], ['dmsm', "DMarket Bot only"]]]
    ]), (arr_field_values) => {
        for (let f=0; f<arr_field_values.length; f++) {
            console.table(arr_field_values[f])
        }
    })
    pop.show()
}