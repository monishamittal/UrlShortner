const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require("../Model/urlModel")

//===========================================Validation=========================================//

const isValid=function(value){
    if(typeof value === 'undefined' || value === null) return false
    if(typeof value === 'string' && value.trim().length === 0) return false
    return true;
} 

//============================================Url Api's=========================================//

const createUrl = async function(req, res) {
    try{
        const data = req.body;
        const baseUrl = 'http:localhost:3000/'

    //Check if data is coming in request body
    if(Object.keys(data).length == 0){
       return res.status(400).send({
        status: false, message: "Invalid URL Please Enter valid details"})
    }
    //check longUrl is present or not
    if(!data.longUrl){
     return res.status(400).send({
       status: false, message: "longUrl is required"})
    }
    // check if baseurl is not found
    if(!validUrl.isUri(baseUrl)){
        return res.status(400).send({
           status: false, message: "baseurl not found"}) 
    }
    
  // check long url is valid or not 
  if (validUrl.isUri(data.longUrl)) {
    let url = await urlModel.findOne({ longUrl: data.longUrl })
    if (url) {
        console.log("Already exists...");
        return res.status(409).send({
            status: false, message: "Already exists", data: url})
  }
   else {
    let urlCode = shortid.generate().toLowerCase(); // generating the url code
    //check if urlCode is present or not
    if (!urlCode) {
        console.log("urlCode is mandatory");
        return res.status(409).send({
            status: false, message: "urlCode is required"})
  }
   //check if urlCode is valid format or not
   if(!isValid(urlCode)){
    return res.status(400).send({
    status: false, message: 'urlCode is not valid format'})
}  
// check if urlCode is present in database
let checkedUrlCode = await urlModel.findOne({urlCode:urlCode}).select({_id:0, __v:0,createdAt: 0, updatedAt: 0 });
if (checkedUrlCode) {
    return res.status(400).send({status: false, message: "ShortUrl is not unique"})}

let shortUrl = baseUrl + urlCode; // creating the short url 
   //check if short url is present or not
    if(!shortUrl){
        return res.status(400).send({
          status: false, message: "shorturl is required"})
    }
    //check if short id is in valid format
    if(!isValid(shortUrl)){
        return res.status(400).send({
        status: false, message: 'shortUrl is not valid format'})
    }  
     data.urlCode = urlCode
     data.shortUrl = shortUrl

     //check if shorturl is present in database
     let getShortUrl = await urlModel.findOne({shortUrl:shortUrl})
     if (getShortUrl) {
        return res.status(400).send({status: false, message: "ShortUrl is not unique"})}

     //creating a document in database
    let newUrl = await urlModel.create(data)
    if(!newUrl){
      return res.status(400).send({
        status : false,message :" No data found due to invalid request"})
  }
     res.status(200).send({
     status: true, message: "Data created successfully", data : newUrl})
    }
}
}
catch (err) {
    console.error(err);
    return res.status(500).send({
      status: false, error: err.message});
  }
}


//==================================================get Url==========================================//

const getUrl = async function(req, res){
    try{
    const url = await urlModel.findOne({ urlCode: req.params.urlCode});
      if (url) {
          console.log("Redirecting to original url.....");
          return res.redirect(url.longUrl);
    } else {
          return res.status(404).send({ message: "No url found" });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({
          status : false, message: "Some error has occurred" });
      }
}





module.exports.createUrl = createUrl
module.exports.getUrl = getUrl

