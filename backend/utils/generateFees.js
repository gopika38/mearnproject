const Fee = require('../models/feeSchema');
const Invoice = require('../models/invoiceSchema');
const Student = require('../models/studentSchema');

const generateMonthlyFees = async () => {
    try {
        const currentDate = new Date();
        const currentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

        const students = await Student.find({});

        for (const student of students) {
            // Check for unpaid fees
            const unpaidFees = await Fee.findOne({
                studentId: student._id,
                paid: false
            });

            // Generate fee for the current month if no unpaid fees exist
            if (!unpaidFees) {
                const existingFee = await Fee.findOne({
                    studentId: student._id,
                    dueDate: currentMonth
                });

                if (!existingFee) {
                    const newFee = new Fee({
                        studentId: student._id,
                        amount: 50, // Monthly fee amount
                        dueDate: currentMonth
                    });
                    await newFee.save();
                }
            }

            // Create missing invoices for already paid fees
            const paidFees = await Fee.find({
                studentId: student._id,
                paid: true,
                invoiceCreated: { $ne: true }
            });

            for (const fee of paidFees) {
                const invoiceExists = await Invoice.findOne({ feeId: fee._id });
                if (!invoiceExists) {
                    const newInvoice = new Invoice({
                        studentId: fee.studentId,
                        amountPaid: fee.amount,
                        paymentDate: fee.paymentDate || fee.updatedAt,
                        description: `Retroactive invoice for fee due on ${fee.dueDate.toLocaleDateString()}`
                    });
                    await newInvoice.save();

                    // Mark the fee as having an invoice created
                    fee.invoiceCreated = true;
                    await fee.save();
                }
            }
        }

        console.log("Fee and invoice generation process completed.");
    } catch (error) {
        console.error("Error during fee and invoice generation:", error);
    }
};

module.exports = generateMonthlyFees;
