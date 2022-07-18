const mongoose = require('mongoose')

//Body validation
const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;              // it checks, is there any key is available or not in request body
};

//Email Validation 
const isValidUrl = function (url) {
    const urlRegex = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/
    return urlRegex.test(url.toLowerCase())
}


module.exports = {  isValidRequestBody,isValidUrl }
