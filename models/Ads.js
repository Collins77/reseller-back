const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Supplier'
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    initialPrice: {
        type: Number,
        required: true
    },
    newPrice: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["featured", "disabled"],
        default: "featured"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
}
)

module.exports = mongoose.model('Ad', adSchema)