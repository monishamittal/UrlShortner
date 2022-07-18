const urlModel = require("../models/urlModel")
const validator = require("../validator/validator")
//const urid = require("urid")
//const { v4: uuidv4 } = require('uuid');
const shortid = require("shortid")

const baseUrl = 'http://localhost:3000/'

const createUrl = async function (req, res) {
 try {
    const {longUrl} = req.body
    const data = req.body
    const id = shortid.generate()
    console.log(id)
    const shortUrl = baseUrl + id
    console.log(shortUrl)
    res.send({shortUrl})

    const dbUrl = await urlModel.create(data)
    return res.status(201).send({status: true, msg: "successfully created", data: dbUrl})



 }

 catch (err) {
        return res.status(500).send({status: false, message : err.message})

 }
}


module.exports.createUrl = createUrl