const mongoose = require("mongoose");
const Message = require("../models/Messages");
const Reseller = require("../models/Reseller");

const searchContacts = async (request, response, next) => {
    try {
        const {searchTerm} = request.body;

        if(searchTerm === undefined || searchTerm === null) {
            return response.status(400).send("Search term is required");
        }

        const sanitizedSearchTerm = searchTerm.replace(
            /[.*+?^${}{}|[/]\\]/g,
            "\\$&"
        );

        const regex = new RegExp(sanitizedSearchTerm, "i");

        const contacts = await Reseller.find({
            $and: [{ _id: {$ne: request.resellerId}},
                {
                    $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
                },
            ],
        });

        return response.status(200).json({ contacts });
    } catch (error) {
        console.log({ error })
        return response.status(500).send("Internal Server Error")
    }
}

const getContactsForDMList = async (request, response, next) => {
    try {
        let {resellerId} = request;

        resellerId = new mongoose.Types.ObjectId(resellerId);
        const contacts = await Message.aggregate([
            {
                $match: {
                    $or:[{sender:resellerId}, {recipient:resellerId}],
                },
            },
            {
                $sort: {timestamp: -1},
            }, 
            {
                $group: {
                    _id: {
                        $cond: {
                            if:{$eq:["sender", resellerId]},
                            then: "$recipient",
                            else: "$sender"
                        },
                    },
                    lastMessageTime: {$first: "$timestamp"},
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactInfo",
                },
            },
            {
                $unwind: "$contactInfo",
            },
            {
                $project: {
                    _id: 1,
                    lastMessageTime: 1,
                    email: "$contactInfo.email",
                    firstName: "$contactInfo.firstName",
                    lastName: "$contactInfo.lastName",
                },
            },
            {
                $sort: { lastMessageTime: -1 },
            },
        ]);

        return response.status(200).json({ contacts });
    } catch (error) {
        console.log({ error })
        return response.status(500).send("Internal Server Error")
    }
}
const getAllContacts = async (request, response, next) => {
    try {
        const resellers = await Reseller.find({_id:{$ne: request.userId}}, "firstName lastName _id email");

        const contacts = resellers.map((reseller)=> ({
            label: reseller.firstName ? `${reseller.firstName} ${reseller.lastName}` : reseller.email,
            value: reseller._id,
        }));

        return response.status(200).json({ contacts });
    } catch (error) {
        console.log({ error })
        return response.status(500).send("Internal Server Error")
    }
}

module.exports = {searchContacts, getContactsForDMList, getAllContacts}