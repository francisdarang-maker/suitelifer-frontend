import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";
import GLOBE from "vanta/dist/vanta.net.min";
import toast from "react-hot-toast";
import Step1 from "./steps/Step1";
import Step2 from "./steps/Step2";
import Step3 from "./steps/Step3";
import Step4 from "./steps/Step4";
import {
  useChangePasswordAPI,
  useRequestResetPasswordAPI,
  useVerifyOtpAPI,
} from "../../../api/auth/useAuthAPI";
import fullsuiteLogo from "../../../assets/logos/logo-fs.svg";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
const ResetPasswordPage = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp_code, setOtp_code] = useState("");
  const [otpSentAt, setOtpSentAt] = useState(null);
  const vantaRef = useRef(null);

  const navigate = useNavigate();

  const { requestResetPassword } = useRequestResetPasswordAPI();
  const { verifyOTP } = useVerifyOtpAPI();
  const { changePassword } = useChangePasswordAPI();

  const handleSendOtp = async (enteredEmail) => {
    const now = Date.now();
    if (email === enteredEmail && otpSentAt && now - otpSentAt < 60 * 1000) {
      return { success: false, reason: "wait" };
    }

    try {
      await requestResetPassword(enteredEmail);
      setEmail(enteredEmail);
      setOtpSentAt(now);
      setStep(2);
      return { success: true };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send OTP. Try again."
      );
      return { success: false, reason: "error" };
    }
  };

  const handleVerifyOtp = async (otp) => {
    try {
      await verifyOTP(email, otp);
      setOtp_code(otp);
      setStep(3);
      toast.success("OTP verified!");
      return { success: true };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to verify OTP. Try again."
      );
      return { success: false, reason: "error" };
    }
  };

  const handleChangePassword = async (new_password) => {
    try {
      await changePassword(email, otp_code, new_password);
      setStep(4);
      return { success: true };
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to change password."
      );
      return { success: false, reason: "error" };
    }
  };

  useEffect(() => {
    let effect = null;
    const loadVanta = () => {
      if (!vantaRef.current) {
        // Suppress THREE.js deprecation warnings for Vanta.js
        const originalWarn = console.warn;
        console.warn = (message, ...args) => {
          if (typeof message === "string" && message.includes("vertexColors")) {
            return; // Suppress the vertexColors warning
          }
          originalWarn(message, ...args);
        };

        effect = GLOBE({
          THREE,
          el: "#vanta-bg",
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale: 1.0,
          scaleMobile: 1.0,
          color: 0xffffff,
          backgroundColor: 0x248da4,
          points: 9.0,
          maxDistance: 22.0,
          spacing: 16.0,
          showDots: true,
        });

        // Restore original console.warn
        console.warn = originalWarn;
      }
    };

    requestAnimationFrame(loadVanta);

    return () => {
      if (effect) effect.destroy();
    };
  }, []);

  return (
    // <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE}>
      <div
        id="vanta-bg"
        className="flex max items-center justify-center h-screen bg-primary p-6"
      >
        <div
          className="dark w-full max-w-md space-y-6 p-10 py-16 rounded-2xl shadow-xl border border-white/20 bg-white/10 backdrop-blur-md mx-auto"
          style={{ width: "min(90%, 600px)" }}
        >
          {step !== 4 && (
            <div className="flex justify-center">
              <img
                src={fullsuiteLogo}
                alt="Logo"
                className="h-15 cursor-pointer"
                onClick={() => navigate("/login")}
              />
            </div>
          )}
          {step === 1 && (
            <Step1 onNext={handleSendOtp} email={email} otpSentAt={otpSentAt} />
          )}
          {step === 2 && (
            <Step2
              onBack={() => setStep(1)}
              onVerify={handleVerifyOtp}
              email={email}
              otpSentAt={otpSentAt}
              setOtpSentAt={setOtpSentAt}
              handleResendOTP={handleSendOtp}
            />
          )}
          {step === 3 && <Step3 onChangePassword={handleChangePassword} />}
          {step === 4 && <Step4 />}
        </div>
      </div>
    // </GoogleReCaptchaProvider>
  );
};

export default ResetPasswordPage;
