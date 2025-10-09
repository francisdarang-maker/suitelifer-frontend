import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const RESEND_DELAY = 60 * 1000;

const Step2 = ({
  onBack,
  onVerify,
  email,
  otpSentAt,
  setOtpSentAt,
  handleResendOTP,
}) => {
  const [otp, setOtp] = useState("");
//   const [timer, setTimer] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Start timer display
  useEffect(() => {
    if (!otpSentAt) return;
    const tick = setInterval(() => {
      const diff = Date.now() - otpSentAt;
      const remaining = Math.max(0, RESEND_DELAY - diff);
    //   setTimer(Math.ceil(remaining / 1000));
      setCooldown(remaining > 0 ? Math.ceil(remaining / 1000) : 0);
    }, 1000);

    return () => clearInterval(tick);
  }, [otpSentAt]);

  const handleResend = async () => {
    const stored = JSON.parse(localStorage.getItem("otpData") || "{}");
    const now = Date.now();

    try {
        setResendLoading(true);
      if (
        stored.email === email &&
        stored.timestamp &&
        now - stored.timestamp < RESEND_DELAY
      ) {
        const wait = Math.ceil(
          (RESEND_DELAY - (now - stored.timestamp)) / 1000
        );
        toast.error(`Wait ${wait}s before resending for this email.`);
        return;
      }

      const { success } = await handleResendOTP(email);
      if (success) {
        const newTimestamp = Date.now();
        localStorage.setItem(
          "otpData",
          JSON.stringify({ email: email, timestamp: newTimestamp })
        );
        setOtpSentAt(newTimestamp);
        setCooldown(RESEND_DELAY / 1000);
        toast.success(`OTP resent to your email.`);
      }
    } catch (error) {
      toast.error(error?.message || "Please try again later.");
    }finally{
        setResendLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      await onVerify(otp);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="text-center mb-3">
        <p className="text-xl font-avenir-black text-white m-0">Enter OTP</p>
        <p className="text-sm text-white/50">
          We sent a 6-digit OTP to{" "}
          <span className="font-medium text-white/50 underline">{email}</span>.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleVerify} className="flex flex-col gap-10">
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          required
          maxLength={6}
          disabled={loading}
          className="text-white w-full p-3 border border-white/20 rounded-md bg-white/10 focus:outline-none focus:ring-2 focus:ring-white placeholder-white/50 tracking-[0.4em] text-center"
        />

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full py-2.5 rounded-lg font-avenir-black text-white bg-white/30 shadow-xs hover:bg-white/40 disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      {/* Actions */}
      <div className="flex justify-between text-sm">
        <button
          onClick={onBack}
          disabled={loading}
          className="text-xs text-white no-underline hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          ← Change Email
        </button>
        <button
          onClick={handleResend}
          disabled={loading || cooldown > 0 || resendLoading}
          className="text-xs text-white no-underline hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-default disabled:hover:no-underline"
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
        </button>
      </div>
    </div>
  );
};

export default Step2;
