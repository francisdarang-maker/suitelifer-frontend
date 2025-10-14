import { useState } from "react";
import toast from "react-hot-toast";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import TwoCirclesLoader from "../../../../assets/loaders/TwoCirclesLoader";

const Step3 = ({ onChangePassword }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const getPasswordErrors = (val) => {
    const errors = [];
    if (val.length < 8) errors.push("min 8 chars");
    if (!/[A-Z]/.test(val)) errors.push("1 upper");
    if (!/[a-z]/.test(val)) errors.push("1 lower");
    if (!/[0-9]/.test(val)) errors.push("1 number");
    if (!/[^A-Za-z0-9]/.test(val)) errors.push("1 symbol");
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passwordErrors = getPasswordErrors(password);
    if (passwordErrors.length > 0) {
      toast.error("Password does not meet requirements");
      return;
    }

    if (confirmPassword !== password) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await onChangePassword(password);
    } finally {
      setLoading(false);
    }
  };

  const passwordErrors = getPasswordErrors(password);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="text-center mb-3">
        <p className="text-xl font-avenir-black text-white m-0">
          Set Up Your New Password
        </p>
        <p className="text-sm text-white/50">
          Please use a strong password you can remember.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* PASSWORD FIELD */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="text-white w-full p-3 border border-white/20 rounded-md bg-white/10 focus:outline-none focus:ring-2 focus:ring-white placeholder-white/50"
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="cursor-pointer absolute top-3 right-3 text-gray-500"
          >
            {showPassword ? (
              <EyeSlashIcon className="size-5 cursor-pointer text-white/70" />
            ) : (
              <EyeIcon className="size-5 cursor-pointer text-white/70" />
            )}
          </button>

          {/* Password Errors */}
          {passwordErrors.length > 0 && (
            <p className="mt-2 text-sm font-avenir-roman-oblique text-white">
              *{passwordErrors.join(", ")}
            </p>
          )}
        </div>

        {/* CONFIRM PASSWORD FIELD */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={confirmPassword}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="text-white w-full p-3 border border-white/20 rounded-md bg-white/10 focus:outline-none focus:ring-2 focus:ring-white placeholder-white/50"
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="cursor-pointer absolute top-3 right-3 text-gray-500"
          >
            {showConfirmPassword ? (
              <EyeSlashIcon className="size-5 cursor-pointer text-white/70" />
            ) : (
              <EyeIcon className="size-5 cursor-pointer text-white/70" />
            )}
          </button>

          {/* Confirm Password Error */}
          {confirmPassword && confirmPassword !== password && (
            <p className="mt-2 text-sm font-avenir-roman-oblique text-white">
              *passwords do not match
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={
            loading || passwordErrors.length > 0 || confirmPassword !== password
          }
          className="w-full py-2.5 mt-5 rounded-lg font-avenir-black text-white bg-white/30 shadow-xs hover:bg-white/40 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="mx-auto w-fit">
              <TwoCirclesLoader
                bg={"transparent"}
                color1={"#bfd1a0"}
                color2={"#ffffff"}
                width={"135"}
                height={"24"}
              />
            </div>
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </div>
  );
};

export default Step3;
