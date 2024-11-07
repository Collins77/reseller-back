const mongoose = require("mongoose");
const Message = require("../models/Messages");
const Reseller = require("../models/Reseller");
const Supplier = require("../models/Supplier");

// Search for Reseller or Supplier contacts
const searchContacts = async (request, response, next) => {
    try {
        const { searchTerm } = request.body;

        if (searchTerm === undefined || searchTerm === null) {
            return response.status(400).send("Search term is required");
        }

        // Sanitize search term to prevent regex injection
        const sanitizedSearchTerm = searchTerm.replace(
            /[.*+?^${}{}|[/]\\]/g,
            "\\$&"
        );

        const regex = new RegExp(sanitizedSearchTerm, "i");

        // Search in both Reseller and Supplier models
        const resellerContacts = await Reseller.find({
            $and: [
                { _id: { $ne: request.userId } },
                {
                    $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
                },
            ],
        });

        const supplierContacts = await Supplier.find({
            $and: [
                { _id: { $ne: request.userId } },
                {
                    $or: [{ firstName: regex }, { lastName: regex }, { email: regex }],
                },
            ],
        });

        // Combine both results into one array
        const contacts = [...resellerContacts, ...supplierContacts];

        return response.status(200).json({ contacts });
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }
};

// Get contacts for the direct message list (either Reseller or Supplier)
// const getContactsForDMList = async (request, response, next) => {
//     try {
//         const userId = request.resellerId || request.supplierId;  // Logged-in user (Reseller or Supplier)

//         const contacts = await Message.aggregate([
//             {
//                 $match: {
//                     $or: [{ sender: userId }, { recipient: userId }],
//                 },
//             },
//             {
//                 $sort: { timestamp: -1 },
//             },
//             {
//                 $group: {
//                     _id: {
//                         $cond: {
//                             if: { $eq: ["$sender", userId] },
//                             then: "$recipient",
//                             else: "$sender"
//                         },
//                     },
//                     lastMessageTime: { $first: "$timestamp" },
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "resellers",  // Look up Reseller contacts
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "resellerContactInfo",
//                 },
//             },
//             {
//                 $lookup: {
//                     from: "suppliers",  // Look up Supplier contacts
//                     localField: "_id",
//                     foreignField: "_id",
//                     as: "supplierContactInfo",
//                 },
//             },
//             {
//                 $addFields: {
//                     contactInfo: {
//                         $cond: {
//                             if: { $gt: [{ $size: "$resellerContactInfo" }, 0] },
//                             then: { $arrayElemAt: ["$resellerContactInfo", 0] },
//                             else: { $arrayElemAt: ["$supplierContactInfo", 0] }
//                         }
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 1,
//                     lastMessageTime: 1,
//                     email: "$contactInfo.email",
//                     firstName: "$contactInfo.firstName",
//                     lastName: "$contactInfo.lastName",
//                 },
//             },
//             {
//                 $sort: { lastMessageTime: -1 },
//             },
//         ]);

//         return response.status(200).json({ contacts });
//     } catch (error) {
//         console.log({ error });
//         return response.status(500).send("Internal Server Error");
//     }
// };
const getContactsForDMList = async (request, response, next) => {
    try {
        let { userId } = request;

        userId = new mongoose.Types.ObjectId(userId);

        const contacts = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { recipient: userId }],
                },
            },
            {
                $sort: { timestamp: -1 },
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userId] },
                            then: "$recipient",
                            else: "$sender",
                        },
                    },
                    lastMessageTime: { $first: "$timestamp" },
                },
            },
            {
                $lookup: {
                    from: "resellers", // Look up in the Reseller model
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactInfoReseller",
                },
            },
            {
                $lookup: {
                    from: "suppliers", // Look up in the Supplier model
                    localField: "_id",
                    foreignField: "_id",
                    as: "contactInfoSupplier",
                },
            },
            {
                $project: {
                    _id: 1,
                    lastMessageTime: 1,
                    email: {
                        $ifNull: [
                            { $arrayElemAt: ["$contactInfoReseller.email", 0] },
                            { $arrayElemAt: ["$contactInfoSupplier.email", 0] },
                        ],
                    },
                    firstName: {
                        $ifNull: [
                            { $arrayElemAt: ["$contactInfoReseller.firstName", 0] },
                            { $arrayElemAt: ["$contactInfoSupplier.firstName", 0] },
                        ],
                    },
                    lastName: {
                        $ifNull: [
                            { $arrayElemAt: ["$contactInfoReseller.lastName", 0] },
                            { $arrayElemAt: ["$contactInfoSupplier.lastName", 0] },
                        ],
                    },
                    // image: {
                    //     $ifNull: [
                    //         { $arrayElemAt: ["$contactInfoReseller.image", 0] },
                    //         { $arrayElemAt: ["$contactInfoSupplier.image", 0] },
                    //     ],
                    // },
                    // color: {
                    //     $ifNull: [
                    //         { $arrayElemAt: ["$contactInfoReseller.color", 0] },
                    //         { $arrayElemAt: ["$contactInfoSupplier.color", 0] },
                    //     ],
                    // },
                },
            },
            {
                $sort: { lastMessageTime: -1 },
            },
        ]);

        return response.status(200).json({ contacts });
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }
};

// Get all contacts for Resellers or Suppliers
const getAllContacts = async (request, response, next) => {
    try {
        const userId = request.userId;

        // Aggregate contacts from Resellers
        const resellers = await Reseller.find(
            { _id: { $ne: userId } },
            "firstName lastName _id email"
        );

        // Aggregate contacts from Suppliers
        const suppliers = await Supplier.find(
            { _id: { $ne: userId } },
            "firstName lastName _id email"
        );

        // Combine the results from both Reseller and Supplier
        const allContacts = [...resellers, ...suppliers];

        // Map the combined contacts into the desired format
        const contacts = allContacts.map((contact) => ({
            label: contact.firstName ? `${contact.firstName} ${contact.lastName}` : contact.email,
            value: contact._id,
        }));

        return response.status(200).json({ contacts });
    } catch (error) {
        console.log({ error });
        return response.status(500).send("Internal Server Error");
    }
};


module.exports = { searchContacts, getContactsForDMList, getAllContacts };
