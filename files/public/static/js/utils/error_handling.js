


export function statusCode(cb, errcb) {
    let sC =  {
        500: function(res, statusText) {
            errcb(500, res, statusText)
        },
        404: function(res, statusText) {
            errcb(404, res, statusText)
        },
        400: function(res, statusText) {
            errcb(400, res, statusText)
        },
        200: (response, statusText) => {
            cb(response, statusText)
        }
    }
    return sC
}