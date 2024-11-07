const express = require("express");
const channelController = require("../controllers/channelController");
const { verifyToken, verifyUserToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-channel", verifyUserToken, channelController.createChannel);
router.get("/get-reseller-channels", verifyUserToken, channelController.getUserChannels);
router.get("/get-channel-messages/:channelId", verifyUserToken, channelController.getChannelMessages);

module.exports = router;
