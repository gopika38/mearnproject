const Fee = require('../models/feeSchema');
const Student = require('../models/studentSchema');

const generateMonthlyFees = async () => {
    try {
        const nextMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
        const students = await Student.find({});

        for (const student of students) {
            const unpaidFees = await Fee.findOne({
                studentId: student._id,
                paid: false
            });

            if (!unpaidFees) {
                const existingFee = await Fee.findOne({
                    studentId: student._id,
                    dueDate: {
                        $gte: nextMonth,
                        $lt: new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 1)
                    }
                });

                if (!existingFee) {
                    const newFee = new Fee({
                        studentId: student._id,
                        amount: 50,  // Monthly fee amount
                        dueDate: nextMonth
                    });
                    await newFee.save();
                }
            }
        }

        console.log("Fee generation process completed.");
    } catch (error) {
        console.error("Error during fee generation:", error);
    }
};


module.exports = generateMonthlyFees;
