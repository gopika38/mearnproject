import axios from 'axios';
import {
    getRequest,
    getSuccess,
    getFailed,
    getError,
    stuffDone
} from './studentSlice';

// export const getStudentFees = (studentId) => async (dispatch) => {
    
//     dispatch(getRequest());
//     try {
//         const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/fees/${studentId}`);
//         console.log(studentId,"studentId");
//         if (response.data) {
//             dispatch(getSuccess(response.data)); // Assuming response.data contains the fees data
//         } else {
//             throw new Error("No data received",);

//         }
//     } catch (error) {
//         const message = error.response ? error.response.data.message : error.message;
//         dispatch(getFailed(message)); // Ensure you handle and dispatch the error message
//     }
// }



export const getAllStudents = (id) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.get(`${process.env.REACT_APP_BASE_URL}/Students/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(getSuccess(result.data));
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const updateStudentFields = (id, fields, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`, fields, {
            headers: { 'Content-Type': 'application/json' },
        });
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
        }
    } catch (error) {
        dispatch(getError(error));
    }
}

export const removeStuff = (id, address) => async (dispatch) => {
    dispatch(getRequest());

    try {
        const result = await axios.put(`${process.env.REACT_APP_BASE_URL}/${address}/${id}`);
        if (result.data.message) {
            dispatch(getFailed(result.data.message));
        } else {
            dispatch(stuffDone());
        }
    } catch (error) {
        dispatch(getError(error));
    }
}