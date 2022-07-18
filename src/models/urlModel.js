//.................................... Import Models for using in this module ....................//
const mongoose = require("mongoose");

//................................. Create Schema .........................//
const urlSchema = new mongoose.Schema(
  {
   
    urlCode: {
       required:true,
       unique:true,
       lowercase:true,
       trim:true 
      }, 
    longUrl: {
      required:true,
      //  valid url
      },
     shortUrl: {
      required:true,
      unique:true
    } 
    
  },
  { timestamps: true }
);

//........................................Export Schema..................................//
module.exports = mongoose.model("Url", urlSchema);                           //provides an interface to the database like CRUD operation
