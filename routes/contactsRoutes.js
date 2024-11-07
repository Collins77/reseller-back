const express = require("express");
const contactsController = require("../controllers/contactsController");
const { verifyToken, verifyUserToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/search", verifyUserToken, contactsController.searchContacts);
router.get("/get-contacts-for-dm", verifyUserToken, contactsController.getContactsForDMList);
router.get("/get-all-contacts", verifyUserToken, contactsController.getAllContacts);

module.exports = router;
