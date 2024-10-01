const mongoose = require("mongoose");
const Channel = require("../models/Channel");
const Reseller = require("../models/Reseller");

const createChannel = async (request, response, next) => {
    try {
        const {name, members} = request.body;

        const resellerId = request.resellerId;

        const admin = await Reseller.findById(resellerId);

        if(!admin) {
            return response.status(400).send("Admin user not found");
        }

        const validMembers = await Reseller.find({_id: {$in: members}});
        if(validMembers.length !== members.length) {
            return response.status(400).send("Some members are not valid users.")
        }

        const newChannel = new Channel({
            name, members, admin: resellerId,
        });

        await newChannel.save();
        return response.status(201).json({channel: newChannel});
       
    } catch (error) {
        console.log({ error })
        return response.status(500).send("Internal Server Error")
    }
}
const getUserChannels = async (request, response, next) => {
    try {
        const resellerId = new mongoose.Types.ObjectId(request.resellerId);
        const channels = await Channel.find({
            $or: [{ admin: resellerId }, { members: resellerId }],
        })
        return response.status(200).json({channels})
       
    } catch (error) {
        console.log({ error })
        return response.status(500).send("Internal Server Error")
    }
}

const getChannelMessages = async (request, response, next) => {
    try {
        const {channelId} = request.params;
        const channel = await Channel.findById(channelId).populate({path:"messages", populate: {
            path: 'sender', select: "firstName lastName email _id companyName",
        }});
        if(!channel) {
            return response.status(404).send("Channel not found");
        }
        const messages = channel.messages;
        return response.status(200).json({messages})
       
    } catch (error) {
        console.log({ error })
        return response.status(500).send("Internal Server Error")
    }
}

module.exports = {createChannel, getUserChannels, getChannelMessages }