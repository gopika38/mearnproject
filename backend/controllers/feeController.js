const Fee = require('../models/feeSchema');

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
        res.send(fee);
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

module.exports = {
    payFee,
    getFeesByStudentId
};
