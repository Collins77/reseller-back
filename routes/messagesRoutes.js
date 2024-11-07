const express = require("express");
const messageController = require("../controllers/messagesController");

const multer = require("multer");
const { verifyToken, verifyUserToken } = require("../middleware/authMiddleware");

const router = express.Router();
const upload = multer({ dest: "uploads/files" });

router.post("/get-messages", verifyUserToken, messageController.getMessages);
router.post("/upload-file", verifyToken, upload.single("file"), messageController.uploadFile);

module.exports = router;
