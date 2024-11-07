const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        // required: true,
        refPath: 'senderModel', // Dynamically set the reference model (Reseller or Supplier)
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'recipientModel', // Dynamically set the reference model (Reseller or Supplier)
        required: false,
    },
    senderModel: {
        type: String,
        enum: ['Reseller', 'Supplier'], // Must match the collection names
        // required: true,
    },
    recipientModel: {
        type: String,
        enum: ['Reseller', 'Supplier'], // Must match the collection names
        required: false,
    },
    messageType: {
        type: String,
        enum: ["text", "file"],
        required: true,
    },
    content: {
        type: String,
        required: function () {
            return this.messageType === "text";
        }
    },
    fileUrl: {
        type: String,
        required: function () {
            return this.messageType === "file";
        },
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model("Messages", messageSchema);
module.exports = Message;
