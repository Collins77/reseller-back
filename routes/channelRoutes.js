const express = require("express");
const channelController = require("../controllers/channelController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create-channel", verifyToken, channelController.createChannel);
router.get("/get-reseller-channels", verifyToken, channelController.getUserChannels);
router.get("/get-channel-messages/:channelId", verifyToken, channelController.getChannelMessages);

module.exports = router;
