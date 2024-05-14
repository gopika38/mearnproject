const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    amountPaid: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);
module.exports = Invoice;
