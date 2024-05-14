const Fee = require('../models/feeSchema');
const Invoice = require('../models/invoiceSchema');

const payFee = async (req, res) => {
    try {
        const { feeId } = req.params;
        const fee = await Fee.findByIdAndUpdate(feeId, {
            paid: true,
            paymentDate: new Date()
        }, { new: true });

        if (!fee) {
            return res.status(404).send({ message: "Fee not found" });
        }

        // Create an invoice
        const newInvoice = new Invoice({
            studentId: fee.studentId,
            amountPaid: fee.amount,
            description: `Payment for fee due on ${fee.dueDate.toLocaleDateString()}`
        });
        await newInvoice.save();

        // Generate next month's fee if no unpaid fees exist
        const currentMonth = new Date(fee.dueDate.getFullYear(), fee.dueDate.getMonth(), 1);
        const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        
        const unpaidFees = await Fee.findOne({
            studentId: fee.studentId,
            paid: false
        });

        let newFee;
        if (!unpaidFees) {
            newFee = new Fee({
                studentId: fee.studentId,
                amount: 50, // Monthly fee amount
                dueDate: nextMonth
            });
            await newFee.save();
        }

        res.send({ fee, invoice: newInvoice, nextFee: newFee });
    } catch (error) {
        res.status(500).json(error);
    }
};

const getFeesByStudentId = async (req, res) => {
    try {
        const studentId = req.params.studentId;
        const fees = await Fee.find({ studentId: studentId }).exec();
        res.json(fees);
    } catch (error) {
        res.status(500).send({ message: "Error retrieving fees", error: error });
    }
};

const getInvoicesByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const invoices = await Invoice.find({ studentId }).exec();
        res.json(invoices);
    } catch (error) {
        res.status(500).send({ message: "Error retrieving invoices", error: error });
    }
};

module.exports = {
    payFee,
    getFeesByStudentId,
    getInvoicesByStudentId
};
