const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require("../models/urlModel")
const redis = require("redis");
const { promisify } = require("util");
const { findOne } = require('../models/urlModel');


//===========================================Validation=========================================//

const isValid = function (value) {
   if (typeof value === 'undefined' || value === null) return false
   if (typeof value !== 'string' || value.trim().length === 0) return false
   return true;
}


//Connect to redis

const redisClient = redis.createClient(
   14700,
   "redis-14700.c264.ap-south-1-1.ec2.cloud.redislabs.com",
   { no_ready_check: true }
);
redisClient.auth("TtC1znFoWKKJqu3cWRSNJWKsmnEZNXCU", function (err) {
   if (err) throw err;
});

redisClient.on("connect", async function () {
   console.log("Connected to Redis..");
});

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


//============================================Url Api's=========================================//

const createUrl = async function (req, res) {
   try {
      const data = req.body;
      const baseUrl = 'http:localhost:3000/'

      //Check if data is coming in request body
      if (Object.keys(data).length == 0) {
         return res.status(400).send({
            status: false, message: "Please enter url"
         })
      }
      //check longUrl is present or not
      if (!isValid(data.longUrl)) {
         return res.status(400).send({
            status: false, message: "long url is required and it should be string"
         })
      }


      // check long url is valid or not 
      if (!validUrl.isUri(data.longUrl)) { return res.status(400).send({ status: false, message: "invalid url" }) }

      longUrl = data.longUrl
      let cachedData = await GET_ASYNC(`${longUrl}`)

      if (cachedData) {
         res.status(200).send(cachedData)
      }
      else {

         let lurl = await urlModel.findOne({ longUrl })
         if (lurl) { return res.status(200).send({ status: true, message: "already exist", data: lurl }) }

         // generating the url code
         let urlCode = shortid.generate().toLowerCase();
         let checkedUrlCode = await urlModel.findOne({ urlCode: urlCode })
         if (checkedUrlCode) {
            return res.status(400).send({ status: false, message: "ShortUrl is not unique" })
         }

         // creating the short url 
         let shortUrl = baseUrl + urlCode;

         data.urlCode = urlCode
         data.shortUrl = shortUrl

         //creating a document in database
         let newUrl = await urlModel.create(data)

        
         let finalUrl = { ...newUrl.toObject() }
         delete finalUrl._id
         delete finalUrl.__v
         delete finalUrl.createdAt
         delete finalUrl.updatedAt

         await SET_ASYNC(`${longUrl}`, JSON.stringify(finalUrl))


         res.status(201).send({
            status: true, message: "Data created successfully", data: finalUrl
         })
      }
   }

   catch (err) {
      return res.status(500).send({
         status: false, error: err.message
      });
   }
}





//==================================================get Url==========================================//

const getUrl = async function (req, res) {
   try {
      let cachedData = await GET_ASYNC(`${req.params.urlCode}`)
      if (cachedData) {
         res.status(200).send(cachedData)
      }
      else {
         const url = await urlModel.findOne({ urlCode: req.params.urlCode })
         if (url) {
            await SET_ASYNC(`${req.params.urlCode}`, url.longUrl)
            return res.redirect(url.longUrl);
         } else {
            return res.status(404).send({ status: false, message: "No url found" });
         }
      }
   }
   catch (err) {
      console.error(err);
      return res.status(500).send({
         status: false, message: "Some error has occurred"
      });
   }
}




module.exports.createUrl = createUrl
module.exports.getUrl = getUrl
