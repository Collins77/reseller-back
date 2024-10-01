const {mkdirSync, renameSync} = require("fs");
const Message = require("../models/Messages");

const getMessages = async (request, response, next) => {
    try {
        const user1 = request.resellerId;
        const user2 = request.body.id;

        if(!user1 || !user2) {
            return response.status(400).send("Both user IDs are required");
        }

        const messages = await Message.find({
            $or: [
                { sender: user1, recipient: user2 },
                { sender: user2, recipient: user1 },
            ],
        }).sort({timestamp: 1});

        return response.status(200).json({ messages });
    } catch (error) {
        console.log({ error })
        return response.status(500).send("Internal Server Error")
    }
}

const uploadFile = async (request, response, next) => {
    try {
        if(!request.file) {
            return response.status(400).send("File is required");
        }
        const date = Date.now();
        let fileDir = `uploads/files/${date}`
        let fileName = `${fileDir}/${request.file.originalname}`;
        await mkdirSync(fileDir, {recursive: true});

        renameSync(request.file.path, fileName)

        return response.status(200).json({ filePath: fileName });
    } catch (error) {
        console.log({ error })
        return response.status(500).send("Internal Server Error")
    }
}

module.exports = {getMessages, uploadFile}