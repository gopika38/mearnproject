const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'student',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    paid: {
        type: Boolean,
        default: false
    },
    paymentDate: {
        type: Date
    }
});

module.exports = mongoose.model("Fee", feeSchema);