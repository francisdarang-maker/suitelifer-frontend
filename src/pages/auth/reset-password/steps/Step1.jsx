import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const RESEND_DELAY = 60 * 1000; // 1 minute

const Step1 = ({ onNext, email }) => {
  const [userEmail, setUserEmail] = useState(email || "");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("otpData") || "{}");
    if (stored.email && stored.timestamp) {
      const diff = Date.now() - stored.timestamp;
      if (diff < RESEND_DELAY) {
        setCooldown(Math.ceil((RESEND_DELAY - diff) / 1000));
      }
    }
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stored = JSON.parse(localStorage.getItem("otpData") || "{}");

      if (
        stored.email === userEmail &&
        stored.timestamp &&
        Date.now() - stored.timestamp < RESEND_DELAY
      ) {
        const wait = Math.ceil(
          (RESEND_DELAY - (Date.now() - stored.timestamp)) / 1000
        );
        toast.error(
          `Please wait ${wait}s before requesting another OTP for this email.`
        );
        return;
      }

      const { success } = await onNext(userEmail);

      if (success) {
        localStorage.setItem(
          "otpData",
          JSON.stringify({ email: userEmail, timestamp: Date.now() })
        );
        setCooldown(RESEND_DELAY / 1000);
        toast.success(`OTP sent to your email.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="text-center mb-3">
        <p className="text-xl font-avenir-black text-white m-0">
          Reset Password
        </p>
        <p className="text-sm text-white/50">
          Enter your email to receive a One-Time Passcode (OTP).
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        <div>
          <input
            id="email"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Enter your email"
            required
            disabled={loading}
            className="text-white w-full p-3 border border-white/20 rounded-md bg-white/10 focus:outline-none focus:ring-2 focus:ring-white placeholder-white/50"
          />
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            (cooldown > 0 &&
              JSON.parse(localStorage.getItem("otpData") || "{}").email ===
                userEmail) ||
            !isValidEmail(userEmail)
          }
          className="w-full py-2.5 rounded-lg font-avenir-black text-white bg-white/30 shadow-xs hover:bg-white/40 disabled:opacity-50 transition cursor-pointer"
        >
          {loading
            ? "Sending..."
            : cooldown > 0 &&
              JSON.parse(localStorage.getItem("otpData") || "{}").email ===
                userEmail
            ? `Wait ${cooldown}s`
            : "Send OTP"}
        </button>
      </form>

      {/* Back to login */}
      <div className=" flex justify-center">
        <a
          href="/login"
          className="text-xs text-white no-underline hover:underline! cursor-pointer"
        >
          Back to log in
        </a>
      </div>
    </div>
  );
};

export default Step1;
