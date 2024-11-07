const mongoose = require("mongoose");
const Channel = require("../models/Channel");
const Reseller = require("../models/Reseller");
const Supplier = require("../models/Supplier");

const createChannel = async (request, response, next) => {
    try {
        const {name, members} = request.body;

        const userId = request.userId;

        // const admin = await Reseller.findById(userId);

        // if(!admin) {
        //     return response.status(400).send("Admin user not found");
        // }

        // const validMembers = await User.find({_id: {$in: members}});
        // if(validMembers.length !== members.length) {
        //     return response.status(400).send("Some members are not valid users.")
        // }

        // Check if the admin is in either Reseller or Supplier models
        const admin = await Reseller.findById(userId) || await Supplier.findById(userId);
        
        if (!admin) {
            return response.status(400).send("Admin user not found");
        }

        // Check if each member exists in either Reseller or Supplier collections
        const validMembers = [];
        for (const memberId of members) {
            const member = await Reseller.findById(memberId) || await Supplier.findById(memberId);
            if (member) validMembers.push(memberId);
        }

        // If not all members are valid, return an error
        if (validMembers.length !== members.length) {
            return response.status(400).send("Some members are not valid users.");
        }

        const newChannel = new Channel({
            name, members, admin: userId,
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
        const userId = new mongoose.Types.ObjectId(request.userId);
        const channels = await Channel.find({
            $or: [{ admin: userId }, { members: userId }],
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
            path: 'sender', select: "firstName lastName email _id",
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