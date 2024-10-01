const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const productSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Supplier'
    }, 
    sku: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    warranty: {
        type: Number,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["available", "limited", "unavailable"],
        // required: [true, "Please enter your product availability"],
        default: "available"
    },
    isFeatured: {
        type: Boolean,
        default: true
    },
},
{
    timestamps: true
}
)

productSchema.plugin(AutoIncrement, {
    inc_field: 'prodnum',
    id: 'productNums',
    start_seq: 1000
})

module.exports = mongoose.model('Product', productSchema)