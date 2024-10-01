const mongoose = require('mongoose');


const infoSchema = new mongoose.Schema({
    country: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
},
{
    timestamps: true
}
)

module.exports = mongoose.model('Info', infoSchema)