const mongoose = require('mongoose');
const jwt = require("jsonwebtoken");

const resellerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please enter your first name!"],
    },
    lastName: {
        type: String,
        required: [true, "Please enter your last name!"],
    },
    email: {
    type: String,
    required: [true, "Please enter your shop email address"],
    },
    password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
    },
    companyName: {
        type: String,
        required: [true, "Please enter your shop mame"],
    },
    address: {
    type: String,
    required: true,
    },
    country: {
    type: String,
    required: true,
    },
    phoneNumber: {
    type: Number,
    required: true,
    },
    roles: {
    type: String,
    default: "Reseller",
    },
    status: {
    type: String,
    enum: ["Not approved", "Approved","On Hold", "Rejected"],
    default: "Not approved",
    },
    createdAt: {
    type: Date,
    default: Date.now(),
    },
})

resellerSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id}, process.env.ACCESS_TOKEN_SECRET,{
      expiresIn: "7d",
    });
  };

module.exports = mongoose.model('Reseller', resellerSchema)