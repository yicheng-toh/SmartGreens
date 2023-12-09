//This file governs the http response message for https and http routes.

//http codes constants
const BAD_REQUEST_RESPONSE = 400;
const INTERNAL_SERVER_ERROR = 500; 

errorMessages = {
    400: "400 Bad Request Response",
    500: "500 Internal Server Error"
}

function sendBadRequestResponse(res, message = "") {
    res.status(BAD_REQUEST_RESPONSE).send(errorMessages[BAD_REQUEST_RESPONSE] , message);
}

function sendInternalServerError(res, message = "" ){
    res.status(INTERNAL_SERVER_ERROR).send(errorMessages[INTERNAL_SERVER_ERROR], message);
}

module.exports = {
    sendBadRequestResponse,
    sendInternalServerError
}