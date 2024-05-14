const Invoice = require('../models/invoiceSchema');
const Student = require('../models/studentSchema'); // Ensure the Student model is imported
const PDFDocument = require('pdfkit');

const getInvoicePDF = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const invoice = await Invoice.findById(invoiceId).populate('studentId');

        if (!invoice) {
            return res.status(404).send({ message: 'Invoice not found' });
        }

        const doc = new PDFDocument({ margin: 50 });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceId}.pdf`);

        // Pipe PDF to response
        doc.pipe(res);

        // Add header
        doc
            // .image('path/to/your/logo.png', 50, 45, { width: 50 })
            .fillColor('#444444')
            .fontSize(20)
            .text('Tution Fees', 110, 57)
            .fontSize(10)
            .text('Your Company Address', 200, 65, { align: 'right' })
            .text('City, State, Zip', 200, 80, { align: 'right' })
            .moveDown();

        // Draw horizontal line
        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, 100)
            .lineTo(550, 100)
            .stroke();

        // Add customer details
        doc
            .fillColor('#000000')
            .fontSize(12)
            .text(`Invoice Number: ${invoiceId}`, 50, 120)
            .text(`Invoice Date: ${new Date(invoice.paymentDate).toLocaleDateString()}`, 50, 135)
            .text(`Balance Due: $${invoice.amountPaid}`, 50, 150)
            .text(`Student Name: ${invoice.studentId.name}`, 50, 165)
            .moveDown();

        // Draw horizontal line
        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, 190)
            .lineTo(550, 190)
            .stroke();

        // Add invoice table header
        const tableTop = 210;
        doc
            .fontSize(10)
            .text('Description', 50, tableTop)
            .text('Amount', 400, tableTop);

        // Draw table header border
        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, tableTop + 15)
            .lineTo(550, tableTop + 15)
            .stroke();

        // Add invoice table row
        const rowPosition = tableTop + 30;
        doc
            .fontSize(10)
            .text(invoice.description, 50, rowPosition)
            .text(`$${invoice.amountPaid}`, 400, rowPosition);

        // Draw table row border
        doc
            .strokeColor('#aaaaaa')
            .lineWidth(1)
            .moveTo(50, rowPosition + 20)
            .lineTo(550, rowPosition + 20)
            .stroke();

        // Add footer
        doc
            .fontSize(10)
            .text('Thank you for your business.', 50, 780, { align: 'center', width: 500 });

        // End PDF document
        doc.end();
    } catch (error) {
        res.status(500).send({ message: 'Error generating invoice PDF', error: error.message });
    }
};

const getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('studentId');
        res.json(invoices);
    } catch (error) {
        res.status(500).send({ message: "Error retrieving invoices", error: error });
    }
};

const getTotalCollected = async (req, res) => {
    try {
        const invoices = await Invoice.find();
        const totalCollected = invoices.reduce((total, invoice) => total + invoice.amountPaid, 0);
        res.json({ totalCollected });
    } catch (error) {
        res.status(500).send({ message: "Error calculating total collected", error: error });
    }
};

module.exports = {
    getInvoicePDF,
    getAllInvoices,
    getTotalCollected,
};
