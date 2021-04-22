const respSchema=require('../models/responseSchema');
const consumerSchema= require('../models/consumerSchema')
const express = require('express');
const router=express.Router();
const fetch = require('node-fetch');
const helper = require('../util/apiUtils').check_for_required_labels;
const dashHit = require('../middleWareFun/dashboardHit');
const dataXT = require('../middleWareFun/formDataExtracter');
const GSheet = require('../middleWareFun/googleSheetMaker');
const Switcher = require('../middleWareFun/switcher');
router.post("/oauth/createSheets",[dashHit, dataXT, GSheet], async (req, res) => {
  return res.status(req.response_from_google.status).json({"response":req.response_from_google});
})


router.put("/put/switch/:integrationId", [Switcher], (req, res) => {
  return res.status(200).json({'msg':"switched"});
})
