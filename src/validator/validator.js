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

//Value Validation
const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}





module.exports = {  isValidRequestBody,isValidUrl, isValid }
