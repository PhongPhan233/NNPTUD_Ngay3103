var express = require("express");
var router = express.Router();
let messageModel = require("../schemas/messages");
let { CheckLogin } = require('../utils/authHandler');
let upload = require('../utils/uploadHandler');

router.get("/:userID", CheckLogin, async function (req, res) {
    try {
        let currentUser = req.user._id;
        let otherUser = req.params.userID;

        let messages = await messageModel.find({
            $or: [
                { from: currentUser, to: otherUser },
                { from: otherUser, to: currentUser }
            ]
        }).sort({ createdAt: 1 });

        res.send(messages);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

router.post("/", CheckLogin, upload.single('file'), async function (req, res) {
    try {
        let currentUser = req.user._id;
        let { to, text, type } = req.body;

        let content = {};

        if (req.file) {
            content = {
                type: "file",
                text: req.file.path 
            };
        }
        else {
            content = {
                type: "text",
                text: text
            };
        }

        let newMessage = new messageModel({
            from: currentUser,
            to: to,
            messageContent: content
        });

        await newMessage.save();

        res.send(newMessage);

    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

router.get("/", CheckLogin, async function (req, res) {
    try {
        let currentUser = req.user._id;

        let messages = await messageModel.aggregate([
            {
                $match: {
                    $or: [
                        { from: currentUser },
                        { to: currentUser }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        user: {
                            $cond: [
                                { $eq: ["$from", currentUser] },
                                "$to",
                                "$from"
                            ]
                        }
                    },
                    lastMessage: { $first: "$$ROOT" }
                }
            }
        ]);

        res.send(messages);
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

module.exports = router;