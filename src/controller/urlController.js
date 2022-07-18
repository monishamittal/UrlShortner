const urlModel = require("../models/urlModel")
const { isValidUrl } = require("../validator/validator")
const shortid = require("shortid")
var validUrl = require('valid-url');

const createUrl = async function (req, res) {

   const { longUrl } = req.body;
   const base = 'http://localhost:3000';

   const urlCode = shortid.generate();
   if ((validUrl.isUri(longUrl))) {
      try {
         let url = await urlModel.findOne({ longUrl });
         if (url) {
            res.json(url);
         } else {
            const shortUrl = `${base}/${urlCode}`;
            url = new urlModel({
               longUrl,
               shortUrl,
               urlCode

            });
            console.log(url)

            await url.save();
           
            res.json(url);
         }
      }
      catch (err) {
         console.log(err);
         res.status(500).json('Server Error');
      }
   } else {
      res.status(400).json('Invalid Original Url');
   }
};


module.exports.createUrl = createUrl