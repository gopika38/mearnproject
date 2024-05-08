import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Make sure to import axios
import { Container, Grid, Paper, Typography } from '@mui/material';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import styled from 'styled-components';
import { useSelector } from 'react-redux';


const StudentFees = ({ studentId }) => {
    const { currentUser } = useSelector((state) => state.user);

    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // console.log(currentUser._id, "currentUser");

    useEffect(() => {
        const fetchFees = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/fees/${currentUser._id}`);
                setFees(response.data); // Assuming response.data contains the fees data
            } catch (error) {
                setError(error.response ? error.response.data.message : error.message);
            }
            setLoading(false);
        };

        fetchFees();
    }, [studentId]);

    const onPaymentSuccess = (details, feeId) => {
        console.log("Payment Successful", details);
        axios.post(`${process.env.REACT_APP_BASE_URL}/PayFee/${feeId}`)
            .then(response => {
                console.log('Payment marked as complete in the database', response.data);
                // Update local state to reflect payment status
                setFees(fees.map(fee => fee._id === feeId ? { ...fee, paid: true } : fee));
            })
            .catch(error => console.error('Error updating payment status', error));
    };


    if (loading) return <p>Loading fees...</p>;
    if (error) return <p>Error loading fees: {error}</p>;
    if (!fees || fees.length === 0) return <p>No fees data available.</p>;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Grid container spacing={3}>
                {fees.map(fee => (
                    <Grid item xs={12} sm={6} md={4} key={fee._id}>
                        <StyledPaper>
                            <Typography variant="h6">Fee Due: {new Date(fee.dueDate).toLocaleDateString()}</Typography>
                            <Typography variant="h5">${fee.amount}</Typography>
                            {!fee.paid && (
                                <PayPalScriptProvider options={{
                                    "client-id": "AeExN1KLnOsfzIx3uvBtGybmdx1SGurw0deY0G-VkcTWDYXWTMRt4fTPA-Q2ojb2-lwuBxIIXj5dsU3L"
                                }}>
                                    <PayPalButtons
                                        createOrder={(data, actions) => {
                                            return actions.order.create({
                                                purchase_units: [{
                                                    amount: {
                                                        value: fee.amount.toString(),
                                                    },
                                                }],
                                            });
                                        }}
                                        onApprove={(data, actions) => {
                                            return actions.order.capture().then(details => {
                                                onPaymentSuccess(details, fee._id);
                                            });
                                        }}
                                    />
                                </PayPalScriptProvider>
                            )}
                        </StyledPaper>
                    </Grid>
                ))}

            </Grid>
        </Container>
    );
}

const StyledPaper = styled(Paper)`
    padding: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
`;

export default StudentFees;
