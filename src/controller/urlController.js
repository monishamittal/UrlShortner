const validUrl = require('valid-url')
const shortid = require('shortid')
const urlModel = require("../models/urlModel")
const redis = require("redis");
const { promisify } = require("util");


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



//1. connect to the server
//2. use the commands :

//Connection setup for redis

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
            status: false, message: "Invalid URL Please Enter valid details"
         })
      }
      //check longUrl is present or not
      if (!isValid(data.longUrl)) {
         return res.status(400).send({
            status: false, message: "long url is required and it should be string"
         })
      }


      // check long url is valid or not 
      if (validUrl.isUri(data.longUrl)) {
         longUrl=data.longUrl
         let cahcedProfileData = await GET_ASYNC(`${data.longUrl}`)
         console.log(cahcedProfileData)
         if (cahcedProfileData.length) {
            res.status(302).send({ status: true, data: cahcedProfileData })
         }
          else {
            let profile = await urlModel.find({longUrl});
            await SET_ASYNC(`${data.longUrl}`, JSON.stringify(profile))
            res.send({ data: profile });
          }

            // let url = await urlModel.findOne({ longUrl: data.longUrl }).select({ _id: 0, __v: 0, createdAt: 0, updatedAt: 0 })
            // if (url) {
            //    console.log("Already exists...");
            //    return res.status(409).send({
            //       status: false, message: "Already exists", data: url
            //    })
            
            
               let urlCode = shortid.generate().toLowerCase(); // generating the url code
               //check if urlCode is present or not
               if (!urlCode) {
                  return res.status(409).send({
                     status: false, message: "urlCode not generated"
                  })
               }

               let checkedUrlCode = await urlModel.findOne({ urlCode: urlCode })
               if (checkedUrlCode) {
                  return res.status(400).send({ status: false, message: "ShortUrl is not unique" })
               }

               let shortUrl = baseUrl + urlCode; // creating the short url 

               data.urlCode = urlCode
               data.shortUrl = shortUrl

               //creating a document in database
               let newUrl = await urlModel.create(data)


               if (!newUrl) {
                  return res.status(400).send({
                     status: false, message: " No data created due to invalid request"
                  })
               }

               let finalUrl = { ...newUrl.toObject() }
               delete finalUrl._id
               delete finalUrl.__v
               delete finalUrl.createdAt
               delete finalUrl.updatedAt

               res.status(200).send({
                  status: true, message: "Data created successfully", data: finalUrl
               })
            }
         }
      
    catch (err) {
      console.error(err);
      return res.status(500).send({
         status: false, error: err.message
      });
   }
}



// const fetchAuthorProfile = async function (req, res) {
//    let cahcedProfileData = await GET_ASYNC(`${req.params.authorId}`)
//    if(cahcedProfileData) {
//      res.send(cahcedProfileData)
//    } else {
//      let profile = await authorModel.findById(req.params.authorId);
//      await SET_ASYNC(`${req.params.authorId}`, JSON.stringify(profile))
//      res.send({ data: profile });
//    }

//  };

//==================================================get Url==========================================//

const getUrl = async function (req, res) {
   try {
      const url = await urlModel.findOne({ urlCode: req.params.urlCode });
      if (url) {
         console.log("Redirecting to original url.....");
         return res.status(302).redirect(url.longUrl);
      } else {
         return res.status(404).send({ message: "No url found" });
      }
   }
   catch (err) {
      console.error(err);
      return res.status(500).send({
         status: false, message: "Some error has occurred"
      });
   }
}

// const fetchShortUrl = async function (req, res) {
//    let cahcedProfileData = await GET_ASYNC(`${req.params.urlCode}`)
//    if(cahcedProfileData) {
//      res.send(cahcedProfileData)
//    } else {
//      let profile = await urlModel.find(req.params.urlCode);
//      await SET_ASYNC(`${req.params.urlCode}`, JSON.stringify(urlCode))
//      res.send({ data: urlCode });
//    }

//  };




module.exports.createUrl = createUrl
module.exports.getUrl = getUrl
