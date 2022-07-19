const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const route = require('./route/route')
//const urid = import("urid")

const app = express()
app.use(bodyParser.json())

mongoose.connect("mongodb+srv://functionupassignment:msJISmjxvX4gvZ9W@functionup.nyvlz.mongodb.net/group29database",
{useNewUrlParser:true})
.then(()=>console.log("mongoDB is connected"))
.catch((error)=>console.log(error))

app.use('/',route)

app.use('*',(req,res)=>{
    return res.status(404).send({status:false,message:"page not found"})
})

app.listen(process.env.PORT || 3000,function(){
    console.log("express app is running on PORT"+(process.env.PORT || 3000))
})




