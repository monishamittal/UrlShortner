const express = require('express');
const router = express.Router();

const urlController = require("../controllers/urlController")

//url api
router.post("/url/shorten", urlController.createUrl )
router.get("/:urlCode", urlController.getUrl )


module.exports = router;