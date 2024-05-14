import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Typography } from '@mui/material';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import styled from 'styled-components';
import { useSelector } from 'react-redux';

const StudentFees = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [fees, setFees] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const feesResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/fees/${currentUser._id}`);
                setFees(feesResponse.data);
    
                const invoicesResponse = await axios.get(`${process.env.REACT_APP_BASE_URL}/invoices/${currentUser._id}`);
                setInvoices(invoicesResponse.data);
            } catch (error) {
                setError(error.response ? error.response.data.message : error.message);
            }
            setLoading(false);
        };
    
        fetchData();
    }, [currentUser._id]);

    const onPaymentSuccess = async (details, feeId) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/PayFee/${feeId}`);
            // Update fees: remove paid fee and add next fee
            setFees(prevFees => {
                return prevFees
                    .filter(fee => fee._id !== feeId)
                    .concat(response.data.nextFee);
            });
            // Add new invoice
            setInvoices(prevInvoices => [...prevInvoices, response.data.invoice]);
            alert('Payment successful! Invoice is now available for download.');
        } catch (error) {
            console.error('Error updating payment status', error);
        }
    };

    const downloadInvoice = (invoice) => {
        const link = document.createElement('a');
        link.href = `${process.env.REACT_APP_BASE_URL}/download/${invoice._id}`;
        link.setAttribute('download', `invoice-${invoice._id}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {fees.filter(fee => !fee.paid).map(fee => (
                    <Grid item xs={12} sm={6} md={4} key={fee._id}>
                        <StyledPaper>
                            <Typography variant="h6">Fee Due: {new Date(fee.dueDate).toLocaleDateString()}</Typography>
                            <Typography variant="h5">${fee.amount}</Typography>
                            <PayPalScriptProvider options={{"client-id": "AeExN1KLnOsfzIx3uvBtGybmdx1SGurw0deY0G-VkcTWDYXWTMRt4fTPA-Q2ojb2-lwuBxIIXj5dsU3L"}}>
                                <PayPalButtons
                                    createOrder={(data, actions) => actions.order.create({
                                        purchase_units: [{ amount: { value: fee.amount.toString() } }]
                                    })}
                                    onApprove={(data, actions) => actions.order.capture().then(details => {
                                        onPaymentSuccess(details, fee._id);
                                    })}
                                />
                            </PayPalScriptProvider>
                        </StyledPaper>
                    </Grid>
                ))}
            </Grid>
            <TableContainer component={Paper} sx={{ mt: 4 }}>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Amount Paid</TableCell>
                            <TableCell align="right">Payment Date</TableCell>
                            <TableCell align="right">Download</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice._id}>
                                <TableCell component="th" scope="row">
                                    {invoice.description}
                                </TableCell>
                                <TableCell align="right">${invoice.amountPaid}</TableCell>
                                <TableCell align="right">{new Date(invoice.paymentDate).toLocaleDateString()}</TableCell>
                                <TableCell align="right">
                                    <Button variant="contained" onClick={() => downloadInvoice(invoice)}>Download</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

const StyledPaper = styled(Paper)`
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
`;

export default StudentFees;
