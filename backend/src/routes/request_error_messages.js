//This file governs the http response message for https and http routes.

//http codes constants
const BAD_REQUEST_RESPONSE = 400;
const PAGE_NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500; 


errorMessages = {
    400: "400 Bad Request Response",
    404: "404 Page Not Found",
    500: "500 Internal Server Error"
}

function sendBadRequestResponse(res, message = "") {
    const response = responseFormatter(errorMessages[BAD_REQUEST_RESPONSE], message);
    
    // res.status(BAD_REQUEST_RESPONSE).send(errorMessages[BAD_REQUEST_RESPONSE] + message);
    res.status(BAD_REQUEST_RESPONSE).json(response);
}

function sendPageNotFound(res, message = ""){
    const response = responseFormatter(errorMessages[PAGE_NOT_FOUND], message);
    // res.status(PAGE_NOT_FOUND).send(errorMessages[PAGE_NOT_FOUND] + message);
    res.status(PAGE_NOT_FOUND).json(response);
}

function sendInternalServerError(res, message = ""){
    const response = responseFormatter(errorMessages[INTERNAL_SERVER_ERROR], message);
    // res.status(INTERNAL_SERVER_ERROR).send(errorMessages[INTERNAL_SERVER_ERROR] + message);
    res.status(INTERNAL_SERVER_ERROR).json(response);
    
}

function responseFormatter(status, message = ""){
    let response = {
        success: 0,
        status: status,
    }
    if(message){
        response.message = message;
    }
    return response;
}

module.exports = {
    sendBadRequestResponse,
    sendPageNotFound,
    sendInternalServerError
}
