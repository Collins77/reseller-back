const mongoose = require('mongoose');


const maintenanceSchema = new mongoose.Schema({
    isActive: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
},
{
    timestamps: true
}
)

module.exports = mongoose.model('Maintenance', maintenanceSchema)