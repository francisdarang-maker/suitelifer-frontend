import { useState } from "react";
import { changePasswordAPI, loginUserAPIhris, requestResetPasswordAPI, verifyOtpAPI } from "./authAPI";

export const useLoginUserAPIhris = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const loginUser = async ({ email, password }) => {
        setLoading(true);
        setError(null);

        try {
            const response = await loginUserAPIhris({ email, password });
            setData(response.data);
            return response.data;
        } catch (err) {
            console.error("Login failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { loginUser, data, error, loading };
};




export const useRequestResetPasswordAPI = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const requestResetPassword = async (email) => {
        setLoading(true);
        setError(null);

        try {
            const response = await requestResetPasswordAPI(email);
            return response;
        } catch (err) {
            console.error("request password reset failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { requestResetPassword, error, loading };
};


export const useVerifyOtpAPI = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const verifyOTP = async (email, otp_code) => {
        setLoading(true);
        setError(null);

        try {
            const response = await verifyOtpAPI(email, otp_code);
            return response;
        } catch (err) {
            console.error("verify otp failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { verifyOTP, error, loading };
};


export const useChangePasswordAPI = () => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const changePassword = async (email, otp_code, new_password) => {
        setLoading(true);
        setError(null);

        try {
            const response = await changePasswordAPI(email, otp_code, new_password);
            return response;
        } catch (err) {
            console.error("change password failed:", err);
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { changePassword, error, loading };
};