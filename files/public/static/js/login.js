

const queryString = window.location.search 
const urlParams = new URLSearchParams(queryString)
var redir = "/dashboard"
if (urlParams.has('redirto') && urlParams.get('redirto') !== "") {
  redir="/" + urlParams.get('redirto')
}



function triggerError(msg) {
  msg = msg || ""
  alert("Ocorreu um erro.\n" + msg)
}
$("#login-form").submit(function (event) {
  var formData = {
    username: $("#username").val(),
    password: $("#password").val()
  };
  $("#loading-spinner").prop('hidden', false);
  $.ajax({
    type: "POST",
    url: "login-attempt",
    data: formData,
    dataType: "json",
    encode: true,
    xhrFields: {
      withCredentials: true
    }
  }).catch((err) => {
    console.log(err); 
    $("#loading-spinner").prop('hidden', true); 
    triggerError("XHR Error")

  }).done(function (data) {
    console.log(data);
    
    $("#loading-spinner").prop('hidden', true);
    let res = JSON.parse(data)
    if (res.success !== true) {
      triggerError(res.success + " | " +res.msg)
      
    } else {
      window.location.href = redir
    }
  })

  event.preventDefault();
});

