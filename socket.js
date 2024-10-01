const { Server: SocketIOServer } = require("socket.io");
const Message = require("./models/Messages");
const Channel = require("./models/Channel");

const setupSocket = (server) => {
    const io = new SocketIOServer(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ['GET', 'POST'],
            credentials: true,
        }
    });

    const resellerSocketMap = new Map();

    const disconnect = (socket) => {
        console.log(`Client Disconnected: ${socket.id}`);
        for(const [resellerId, socketId] of resellerSocketMap.entries()) {
            if(socketId===socket.id) {
                resellerSocketMap.delete(resellerId);
                break;
            }
        }
    };

    const sendMessage = async (message) => {
        const senderSocketId = resellerSocketMap.get(message.sender);
        const recipientSocketId = resellerSocketMap.get(message.recipient);

        const createdMessage = await Message.create(message);

        const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName companyName")
        .populate("recipient", "id email firstName lastName companyName");

        if(recipientSocketId) {
            io.to(recipientSocketId).emit("receiveMessage", messageData);
        }

        if(senderSocketId) {
            io.to(senderSocketId).emit("receiveMessage", messageData);
        }

    }

    const sendChannelMessage = async(message) => {
        const {channelId, sender, content, messageType, fileUrl} = message;

        const createdMessage = await Message.create({
            sender,
            recipient: null, 
            content,
            messageType,
            timestamp: new Date(),
            fileUrl,
        });

        const messageData = await Message.findById(createdMessage._id).populate("sender", "id email firstName lastName companyName").exec();

        await Channel.findByIdAndUpdate(channelId, {
            $push: { messages: createdMessage._id },
        });

        const channel = await Channel.findById(channelId).populate("members");

        const finalData = {...messageData._doc, channelId: channel._id};

        if(channel && channel.members) {
            channel.members.forEach((member) => {
                const memberSocketId = resellerSocketMap.get(member._id.toString());
                if(memberSocketId) {
                    io.to(memberSocketId).emit("receive-channel-message", finalData);
                }
            });
            const adminSocketId = resellerSocketMap.get(channel.admin._id.toString());
            if(adminSocketId) {
                io.to(adminSocketId).emit("receive-channel-message", finalData);
            }
        }
    }

    io.on("connection", (socket) => {
        const resellerId = socket.handshake.query.resellerId;

        if(resellerId) {
            resellerSocketMap.set(resellerId, socket.id);
            console.log(`Reseller connected: ${resellerId} with socket ID: ${socket.id}`);
        } else {
            console.log("Reseller id not provided during connection")
        }

        socket.on("sendMessage", sendMessage);
        socket.on("send-channel-message", sendChannelMessage);
        socket.on("disconnect", () =>disconnect(socket))
    })
};

module.exports = setupSocket