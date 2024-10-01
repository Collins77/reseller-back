const mongoose = require('mongoose');


const generalSchema = new mongoose.Schema({
    logo: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    backgroundImage: {
        type: String,
        required: true,
    },
    siteTitle: {
        type: String,
        required: true
    },
    heroTitle: {
        type: String,
        required: true
    },
    heroSubTitle: {
        type: String,
        required: true
    },
},
{
    timestamps: true
}
)

module.exports = mongoose.model('General', generalSchema)