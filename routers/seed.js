const router = require("express").Router();
var seedCtrl = require("../controller/seed.controller");

router.get("/runSeed", seedCtrl.runSeed);
