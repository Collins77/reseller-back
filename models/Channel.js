const mongoose = require("mongoose");

const channelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    members: [
        {type: mongoose.Schema.ObjectId, ref: "Reseller", required: true}],
    admin: {type: mongoose.Schema.ObjectId, ref: "Reseller", required: true},
    messages: [{type: mongoose.Schema.ObjectId, ref: "Messages", required:false}],
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        type: Date,
        default: Date.now(),
    },
});

channelSchema.pre("save", function (next) {
    this.set({ updatedAt: Date.now() });
    next();
})
channelSchema.pre("findOneAndUpdate", function (next) {
    this.set({ updatedAt: Date.now() });
    next();
})

const Channel = mongoose.model("Channel", channelSchema);
module.exports = Channel;