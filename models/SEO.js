const mongoose = require('mongoose');


const seoSchema = new mongoose.Schema({
    metaTitle: {
        type: String,
        required: true
    },
    metaDesc: {
        type: String,
        required: true
    },
    metaTags: {
        type: String,
        required: true
    },
},
{
    timestamps: true
}
)

module.exports = mongoose.model('SEO', seoSchema)