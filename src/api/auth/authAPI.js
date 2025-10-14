import hrisAPI from "../../utils/hrisAPI";

export const loginUserAPIhris = async ({ email, password }) => {
  const response = await hrisAPI.post("/api/auth/login", {
    
    user_email: email,
    password,
    service: "SUITELIFER",
  });

  return response;
};



export const requestResetPasswordAPI = async (user_email) => {
  const response = await hrisAPI.post("/api/auth/reset-request", {
    user_email
  })
  return response;
}

export const verifyOtpAPI = async (user_email, otp_code) => {
  const response = await hrisAPI.post("/api/auth/verify-otp", {
    user_email,
    otp_code
  })
  return response;
} 

export const changePasswordAPI = async (user_email, otp_code, new_password) => {
  const response = await hrisAPI.patch("/api/auth/reset-password", {
    user_email,
    otp_code,
    new_password
  })
  return response;
}