

let RUPDM = document.getElementById('remote-update-dmarket')

PREFIX = "/dmsm/"

RUPDM.onclick = () => {
    $.ajax({
        type: "method",
        url: "url",
        data: "data",
        dataType: "dataType",
        success: function (response) {
            
        }
    });
}