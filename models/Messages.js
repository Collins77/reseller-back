const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Reseller",
        required: true,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Reseller",
        required: false,
    },
    messageType: {
        type: String,
        enum: ["text","file"],
        required: true,
    },
    content: {
        type: String,
        required: function() {
            return this.messageType === "text";
        }
    },
    fileUrl: {
        type: String,
        required: function() {
            return this.messageType === "file";
        },
    },
    timestamp: {
        type: Date,
        default: Date.now()
    },
});

const Message = mongoose.model("Messages", messageSchema);
module.exports = Message;